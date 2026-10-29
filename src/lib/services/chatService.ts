import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { Conversation, Message, Profile } from '../../types/database';

const LOCAL_KEY_CONVS = 'pairly_dev_conversations';

export class ChatService {
  private static getLocalConversations(): Conversation[] {
    const raw = localStorage.getItem(LOCAL_KEY_CONVS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveLocalConversations(list: Conversation[]): void {
    localStorage.setItem(LOCAL_KEY_CONVS, JSON.stringify(list));
  }

  /**
   * Retrieves all conversations the user is a participant of.
   */
  static async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('conversations') as any)
        .select(`
          *,
          participant_one:profiles!conversations_participant_one_id_fkey(*),
          participant_two:profiles!conversations_participant_two_id_fkey(*)
        `)
        .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw new Error(error.message);
      return (data || []) as Conversation[];
    }

    // Local Preview Storage fallback
    const list = this.getLocalConversations();
    const userConvs = list.filter(
      (c) => c.participant_one_id === userId || c.participant_two_id === userId
    );

    // Attach last message preview if available
    return userConvs.map((conv) => {
      const msgsRaw = localStorage.getItem('pairly_dev_messages_' + conv.id);
      if (msgsRaw) {
        try {
          const msgs: Message[] = JSON.parse(msgsRaw);
          if (msgs.length > 0) {
            conv.last_message = msgs[msgs.length - 1];
          }
        } catch {
          // ignore
        }
      }
      return conv;
    });
  }

  /**
   * Retrieves a single conversation by ID with access authorization check.
   */
  static async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('conversations') as any)
        .select(`
          *,
          participant_one:profiles!conversations_participant_one_id_fkey(*),
          participant_two:profiles!conversations_participant_two_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single();

      if (error || !data) return null;
      const conv = data as Conversation;
      if (conv.participant_one_id !== userId && conv.participant_two_id !== userId) {
        throw new Error('Unauthorized to view this conversation');
      }
      return conv;
    }

    const list = this.getLocalConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (!conv) return null;
    if (conv.participant_one_id !== userId && conv.participant_two_id !== userId) {
      throw new Error('Unauthorized to view this conversation');
    }
    return conv;
  }

  /**
   * Retrieves all messages for an authorized conversation.
   */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('messages') as any)
        .select('*, sender:profiles(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as Message[];
    }

    const raw = localStorage.getItem('pairly_dev_messages_' + conversationId);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Sends a message into an authorized conversation.
   */
  static async sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderProfile?: Profile;
    content: string;
  }): Promise<Message> {
    const trimmed = params.content.trim();
    if (!trimmed) {
      throw new Error('Message content cannot be empty.');
    }
    if (trimmed.length > 3000) {
      throw new Error('Message length exceeds 3000 characters limit.');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('messages') as any)
        .insert({
          conversation_id: params.conversationId,
          sender_id: params.senderId,
          content: trimmed,
        })
        .select('*, sender:profiles(*)')
        .single();

      if (error) throw new Error(error.message);
      return data as Message;
    }

    // Local Preview Storage fallback
    const key = 'pairly_dev_messages_' + params.conversationId;
    const raw = localStorage.getItem(key);
    const msgs: Message[] = raw ? JSON.parse(raw) : [];

    const newMsg: Message = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      content: trimmed,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: params.senderProfile,
    };

    msgs.push(newMsg);
    localStorage.setItem(key, JSON.stringify(msgs));

    // Update conversation last_message_at
    const convs = this.getLocalConversations();
    const c = convs.find((conv) => conv.id === params.conversationId);
    if (c) {
      c.last_message_at = newMsg.created_at;
      c.last_message = newMsg;
      this.saveLocalConversations(convs);
    }

    return newMsg;
  }

  /**
   * Marks unread messages in conversation as read.
   */
  static async markMessagesAsRead(conversationId: string, currentUserId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      await (supabase.from('messages') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .is('read_at', null);
      return;
    }

    const key = 'pairly_dev_messages_' + conversationId;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const msgs: Message[] = JSON.parse(raw);
      let changed = false;
      const now = new Date().toISOString();
      msgs.forEach((m) => {
        if (m.sender_id !== currentUserId && !m.read_at) {
          m.read_at = now;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(key, JSON.stringify(msgs));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Subscribes to real-time message inserts using Supabase Realtime channel.
   */
  static subscribeToMessages(
    conversationId: string,
    onMessageReceived: (message: Message) => void
  ): () => void {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (payload.new) {
              onMessageReceived(payload.new as Message);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // No-op cleanup for local mode
    return () => {};
  }
}
