# Pairly Trust, Safety & Security Model

## 1. Row Level Security (RLS) Policy Audit

Every table in the Pairly database enforces Row Level Security:

1. **`profiles`:**
   - Public read for discoverable profiles (`profile_visibility = 'public'`).
   - Mutations strictly restricted to `auth.uid() = id`.
   - Sensitive administrative fields (`verification_status`, `role`) cannot be self-modified.

2. **`connection_requests`:**
   - Read access restricted to `auth.uid() = requester_id OR auth.uid() = recipient_id`.
   - Write access restricted to the requester.
   - Status updates restricted to participants.
   - Partial unique index on unordered participant pairs prevents concurrent duplicate pending requests.

3. **`conversations` & `messages`:**
   - Conversations only accessible by confirmed participants.
   - Messages readable and writable only by participants of that conversation.
   - `sender_id` must match `auth.uid()`.

4. **`exchanges`:**
   - Read and confirm operations restricted to the two participants.
   - Atomic completion requires independent confirmations from both sides.

5. **`reviews`:**
   - Requires completed exchange status.
   - `reviewer_id = auth.uid()` and `reviewee_id <> reviewer_id`.
   - `UNIQUE(exchange_id, reviewer_id)` prevents duplicate reviews.

6. **`user_blocks`:**
   - Blocker manages their own blocks. Blocked users cannot query or inspect the block list.

7. **`reports` & `verification_requests`:**
   - Private evidence and reports accessible only to submitter and authorized admins.
   - Moderator notes accessible only to administrators.

8. **`admin_users`:**
   - Admin access checked via `is_current_user_admin()` function with `SECURITY DEFINER` and `SET search_path = public`.
