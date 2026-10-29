-- ==============================================================================
-- Migration: 20261029000004_requests_and_chat.sql
-- Project: Pairly (Share Skills. Help Others. Grow Together.)
-- Phase 5: Connection Requests, Atomic Conversation Setup & Realtime Chat
-- ==============================================================================

-- 1. Create connection_requests table
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_different_participants CHECK (requester_id <> recipient_id)
);

-- 2. Indexing and race-safe pending request uniqueness
CREATE INDEX IF NOT EXISTS idx_conn_req_requester ON public.connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_conn_req_recipient ON public.connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_conn_req_status ON public.connection_requests(status);
CREATE INDEX IF NOT EXISTS idx_conn_req_listing ON public.connection_requests(listing_id);

-- Enforce no duplicate pending requests between the same unordered pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_conn_req_unique_pending_pair
ON public.connection_requests (
  LEAST(requester_id, recipient_id),
  GREATEST(requester_id, recipient_id)
)
WHERE status = 'pending';

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_conn_req_updated_at ON public.connection_requests;
CREATE TRIGGER trg_conn_req_updated_at
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_request_id UUID UNIQUE NOT NULL REFERENCES public.connection_requests(id) ON DELETE RESTRICT,
  participant_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NULL,
  CONSTRAINT check_distinct_conversation_members CHECK (participant_one_id <> participant_two_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC NULLS LAST);

-- 4. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 3000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- Update last_message_at trigger on messages insertion
CREATE OR REPLACE FUNCTION public.handle_message_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_sent ON public.messages;
CREATE TRIGGER trg_messages_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_sent();

-- 5. Atomic RPC: Accept Connection Request & Create Linked Conversation
CREATE OR REPLACE FUNCTION public.accept_connection_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
  v_conv_id UUID;
BEGIN
  -- 1. Fetch request with row lock
  SELECT * INTO v_req
  FROM public.connection_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection request not found';
  END IF;

  -- Verify current user is recipient
  IF v_req.recipient_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the recipient may accept this request';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request cannot be accepted in % status', v_req.status;
  END IF;

  -- 2. Update status to accepted
  UPDATE public.connection_requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_request_id;

  -- 3. Atomically create conversation
  INSERT INTO public.conversations (
    connection_request_id,
    participant_one_id,
    participant_two_id,
    created_at
  ) VALUES (
    p_request_id,
    v_req.requester_id,
    v_req.recipient_id,
    NOW()
  )
  RETURNING id INTO v_conv_id;

  -- 4. Initial system or welcome message if intro message existed
  IF v_req.message IS NOT NULL AND length(trim(v_req.message)) > 0 THEN
    INSERT INTO public.messages (
      conversation_id,
      sender_id,
      content,
      created_at
    ) VALUES (
      v_conv_id,
      v_req.requester_id,
      v_req.message,
      NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'conversation_id', v_conv_id,
    'request_id', p_request_id
  );
END;
$$;

-- 6. Row Level Security Policies
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Connection requests policies:
CREATE POLICY "Participants can view their connection requests"
  ON public.connection_requests
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can create connection requests"
  ON public.connection_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participants can update connection requests status"
  ON public.connection_requests
  FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Conversations policies:
CREATE POLICY "Participants can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- Messages policies:
CREATE POLICY "Participants can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

CREATE POLICY "Participants can insert messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );
