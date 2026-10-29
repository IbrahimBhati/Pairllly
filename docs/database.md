# Pairly Database Architecture & Schema Reference

**Project:** Pairly  
**Tagline:** Share Skills. Help Others. Grow Together.  
**Provider:** Supabase PostgreSQL + Row Level Security (RLS)

---

## 1. Migrations Overview

| Migration File | Phase | Core Tables & RPCs Added |
| :--- | :--- | :--- |
| `20261029000001_initial_schema.sql` | Phase 1 | `profiles`, `skills`, triggers, RLS policies, seed catalog |
| `20261029000002_user_skills.sql` | Phase 2 | `user_skills`, `complete_user_onboarding` RPC |
| `20261029000003_listings.sql` | Phase 3 | `listings`, `verify_listing_skill_ownership` trigger, `ON DELETE RESTRICT` |
| `20261029000004_requests_and_chat.sql` | Phase 5 | `connection_requests`, `conversations`, `messages`, `accept_connection_request` RPC |
| `20261029000005_exchanges_reviews_gamification.sql` | Phase 6 | `exchanges`, `reviews`, `badges`, `user_badges`, `points_ledger`, `confirm_exchange_completion` RPC |
| `20261029000006_safety_and_verification.sql` | Phase 6 | `user_blocks`, `reports`, `verification_requests` |
| `20261029000007_admin_and_settings.sql` | Phase 7 | `admin_users`, `user_settings`, `admin_audit_logs`, `is_current_user_admin`, `admin_moderate_report`, `admin_review_verification` |

---

## 2. Table Specifications

### `connection_requests`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `listing_id UUID NULL REFERENCES listings(id) ON DELETE SET NULL`
- `message TEXT NULL`
- `status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Partial Unique Index: `(LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id)) WHERE status = 'pending'`

### `conversations`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `connection_request_id UUID UNIQUE NOT NULL REFERENCES connection_requests(id) ON DELETE RESTRICT`
- `participant_one_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `participant_two_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `last_message_at TIMESTAMPTZ NULL`

### `messages`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE`
- `sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 3000)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `read_at TIMESTAMPTZ NULL`

### `exchanges`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `connection_request_id UUID UNIQUE NOT NULL REFERENCES connection_requests(id) ON DELETE RESTRICT`
- `status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled'))`
- `requester_confirmed_at TIMESTAMPTZ NULL`
- `recipient_confirmed_at TIMESTAMPTZ NULL`
- `completed_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### `reviews`
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE RESTRICT`
- `reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)`
- `feedback TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Constraint: `UNIQUE(exchange_id, reviewer_id)`

### `badges` & `user_badges`
- Starter badges seeded: `First Exchange`, `Helpful Member`, `Knowledge Sharer`, `Consistent Collaborator`, `Community Builder`.
- Criteria evaluation: deterministic and documented.

### `points_ledger`
- Event-keyed points (50 pts for exchange completion, 10 pts for verified review).
- Enforces `UNIQUE(user_id, event_key)` preventing duplicate point rewards.

### `user_blocks` & `reports`
- Database-level isolation preventing blocked users from initiating connection requests or messages.
- Confidential reports viewable only by reporter and authorized administrators.

### `admin_users` & `user_settings`
- Privileged operations guarded by `is_current_user_admin()` SECURITY DEFINER procedure with fixed search path.
