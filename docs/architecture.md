# Pairly System Architecture

**Product:** Pairly — University-level peer-to-peer skill-sharing platform.  
**Tagline:** Share Skills. Help Others. Grow Together.

---

## 1. System Topology

```
+-----------------------------------------------------------------+
|                        Client Layer                             |
|  - Next.js / Vite SPA (React 19 + TypeScript Strict Mode)       |
|  - Tailwind CSS Theme System (Class-based Light / Dark Tokens)  |
|  - Lucide Icons & Responsive Touch-Optimized Layouts            |
+-----------------------------------------------------------------+
                               |
                               v
+-----------------------------------------------------------------+
|                    Service & Logic Layer                        |
|  - MatchingService: Deterministic Set-Theoretic Scoring        |
|  - RequestsService: Atomically Handled Connection Lifecycle    |
|  - ChatService: Realtime Messaging with Read Tracking          |
|  - ExchangesService: Dual-Confirmation Synchronization         |
|  - ReviewsService: Verified Exchange Review System             |
|  - GamificationService: Badges & Points Ledger Engine          |
|  - SafetyService: Blocks, Reports, and Credential Verification |
|  - AdminService: Platform Moderation & Real Database Metrics    |
+-----------------------------------------------------------------+
                               |
                               v
+-----------------------------------------------------------------+
|                    Data & Security Layer                        |
|  - Supabase PostgreSQL Database with Strict Constraints         |
|  - Supabase Realtime Channels (messages:conversationId)         |
|  - Row Level Security (RLS) on all 12 tables                    |
|  - Atomic SECURITY DEFINER Procedures with Fixed Search Paths   |
|  - Local Storage Resilient Dev Preview Mode                     |
+-----------------------------------------------------------------+
```

---

## 2. Smart Matching Mathematical Engine

The core matching algorithm is purely deterministic:
Given User A and candidate peer User B:
- $A_{offers}$: skills where direction = `'offer'`
- $A_{wants}$: skills where direction = `'want'`
- $B_{offers}$: skills where direction = `'offer'`
- $B_{wants}$: skills where direction = `'want'`

Comparisons are strictly computed on stable unique `skill_id` foreign keys, never display strings.

1. **A's Wants Coverage:**
   $$\text{Coverage}_A = \frac{|B_{offers} \cap A_{wants}|}{|A_{wants}|}$$

2. **B's Wants Coverage:**
   $$\text{Coverage}_B = \frac{|A_{offers} \cap B_{wants}|}{|B_{wants}|}$$

3. **Overall Compatibility Score:**
   $$\text{Match Percentage} = \text{round}\left(100 \times \frac{\text{Coverage}_A + \text{Coverage}_B}{2}\right)$$

4. **Reciprocal Match Condition:**
   $$|B_{offers} \cap A_{wants}| \ge 1 \quad \text{AND} \quad |A_{offers} \cap B_{wants}| \ge 1$$
