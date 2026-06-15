# ShiftFlow V2 — (Setup Guide)

## What is ShiftFlow?
A shift scheduling app for small businesses (grocery stores, retail, etc.).
- Employees mark their availability + preferred times
- Admin builds the weekly schedule, assigns shifts manually
- Schedule view matches a professional weekly PDF format

---

## Step 1 — Supabase Database Setup

1. Go to **supabase.com** → your project → **SQL Editor**
2. Open `supabase-schema.sql` from this zip
3. **Select all → Copy → Paste into SQL Editor → Run**
4. This will drop old tables and create fresh ones

> ⚠️ If you already have data you want to keep, do NOT run this — contact your developer first.

---

## Step 2 — Get your Supabase keys

1. Supabase → your project → **Settings → API**
2. Copy:
   - **Project URL** → looks like `https://xxxxxxxx.supabase.co`
   - **anon public key** → long string starting with `eyJ...`

---

## Step 3 — Upload to GitHub

1. Extract this zip
2. Go into the `shiftflow2` folder
3. On GitHub → your repo → delete all old files
4. Upload everything **inside** `shiftflow2` folder (not the folder itself)
5. `package.json` should be visible at root level of the repo

---

## Step 4 — Set Environment Variables on Vercel

1. Vercel → your project → **Settings → Environment Variables**
2. Add these 3 variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_ADMIN_PASSWORD` | Your chosen admin password |

3. Click **Save** → Vercel will auto-redeploy

---

## How to Use

### Admin
- Open your app URL → select **Admin** → enter password
- **⏰ Shift Types** — create your shifts (Morning, Afternoon, Night etc.) with default times
- **👥 Team** — add all your employees
- **✅ Availability** — see who is available when, preview each employee's form
- **📅 Schedule** — build the weekly schedule:
  - Click **+ Add** on any day/shift slot
  - Select employee (available ones shown first)
  - Set their exact start/end time
  - Click **Assign**
  - Use **✎** to edit or remove any assignment
  - Navigate weeks with ← Prev / Next →

### Employees
- Open the same app URL → select **Employee** → pick their name
- For each day, tap the shift they are available for
- If available, they can set their preferred start and end time
- Data saves automatically — manager sees it instantly

---

## Changing Admin Password
1. Vercel → Settings → Environment Variables
2. Edit `VITE_ADMIN_PASSWORD`
3. Vercel will redeploy automatically

---

## Tech Stack
- **Frontend:** React + Vite
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (free)
- **Cost:** $0 for small teams

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank white screen | Check browser console for errors — likely Supabase URL/key missing |
| "Invalid supabaseUrl" | Re-check VITE_SUPABASE_URL in Vercel env variables |
| Incorrect password | Check VITE_ADMIN_PASSWORD in Vercel env variables |
| Data not saving | Check Supabase RLS policies — re-run the schema SQL |
| 404 on Vercel | Check Root Directory is blank in Vercel Build Settings |
