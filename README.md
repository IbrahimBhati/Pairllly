# Pairly — University Peer-to-Peer Skill Sharing Platform

> **Share Skills. Help Others. Grow Together.**

Pairly connects university students, teachers, and campus community members to teach skills, learn from others, exchange knowledge, and collaborate.

---

## 🚀 One-Click Deploy to Vercel via GitHub

### Step 1: Push this repository to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `pairly` (choose Public or Private).
2. In your terminal, link your local repository and push:

```bash
# Add your GitHub repository remote
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/pairly.git

# Push to the main branch
git push -u origin main
```

---

### Step 2: Import & Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) (sign in with your GitHub account).
2. Under **Import Git Repository**, select your `pairly` repository.
3. Vercel automatically detects the framework configuration via `vercel.json`:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. *(Optional)* Add your Supabase environment variables under **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key
   *(Note: If not configured, Pairly gracefully runs in isolated Preview Mode with seed data)*
5. Click **Deploy**.

Vercel will build and deploy the app in under 60 seconds with an instant production HTTPS URL and automated CI/CD deployments on every `git push`!

---

## 🛠 Features

- **Deterministic Smart Matching:** Set-theoretic reciprocal matching based on stable skill IDs and learning goals.
- **Full Listing Lifecycle:** Create, edit, publish, pause, and close listings with session format (online, in-person, hybrid).
- **Connection Requests:** Propose skill exchanges with introductory messages and status management.
- **Real-Time Messaging:** Live chat powered by Supabase Realtime channels with read receipts.
- **Dual-Confirmation Exchanges:** Both participants independently verify session completion.
- **Reviews & Ratings:** Authentic 5-star peer reviews tied strictly to verified completed sessions.
- **Gamification:** Points ledger and earned achievement badges (*First Exchange*, *Helpful Member*, *Knowledge Sharer*, *Consistent Collaborator*, *Community Builder*).
- **Trust & Safety:** Confidential user/listing reporting, member blocking, and academic verification requests.
- **Administration Console:** Real database metrics, report moderation, credential reviews, and listing controls.
- **Dark Mode:** Accessible class-based theme switcher (Light / Dark / System).

---

## 📦 Tech Stack

- **Frontend:** React 19, TypeScript (Strict Mode), Vite
- **Styling:** Tailwind CSS (Pairly Deep Purple `#4B3F72`, Soft Lavender `#A78BFA`, Mint Green `#A7F3D0`)
- **Icons:** Lucide React
- **Database & Auth:** Supabase PostgreSQL + Row Level Security (RLS) + Realtime
- **Deployment:** Vercel (configured via `vercel.json`)
