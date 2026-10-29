# Pairly — Setup & Environment Guide

## 1. Environment Configuration

To connect Pairly to your dedicated Supabase instance, add the following environment variables (or Replit Secrets):

```bash
# Vite Client-side keys
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# Next.js / Server-compatible keys (if deployed under Next.js)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"
```

> **Security Rule:** Never store service-role keys or passwords in frontend code. Use Replit Secrets or environment variables.

---

## 2. Applying Migrations

Run migrations in chronological sequence:
1. **Initial Schema & Seed Catalog (Phase 1):**
   - File: `supabase/migrations/20261029000001_initial_schema.sql`
   - Provisions `profiles`, `skills` (15 seeded catalog entries), user creation trigger, and basic RLS.
2. **User Skills & Onboarding RPC (Phase 2):**
   - File: `supabase/migrations/20261029000002_user_skills.sql`
   - Provisions `user_skills` table, directional unique constraints, RLS policies, and `complete_user_onboarding` atomic function.
3. **Listings Schema & Ownership Constraints (Phase 3):**
   - File: `supabase/migrations/20261029000003_listings.sql`
   - Provisions `listings` table, skill ownership validation triggers, `ON DELETE RESTRICT` constraints, and listing RLS policies.

Run via:
1. **Supabase SQL Editor:**
   - Copy contents of each migration file into your Supabase Dashboard SQL Editor and click **Run**.
2. **Supabase CLI:**
   ```bash
   npx supabase db push
   ```

---

## 3. Development Workflow

- Run development server:
  ```bash
  npm run dev
  ```
- Run type checks / lint:
  ```bash
  npm run lint
  ```
- Build production bundle:
  ```bash
  npm run build
  ```
