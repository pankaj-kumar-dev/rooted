# Auth + persistence setup (Supabase)

Signed-in users get their own habits (max 5 active) and daily check-ins saved in Postgres. Signed-out visitors see the demo. Without the env vars below the app runs demo-only and hides sign-in.

1. Create a Supabase project.
2. **Auth → Providers → Email**: enable; keep "Confirm email" on. Magic link only, no password UI exists.
3. **Auth → URL Configuration**: Site URL `http://localhost:5173`; add the same (and your production origin) to Redirect URLs.
4. **SQL editor**: run `supabase/migrations/0001_init.sql`.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API). Use only the anon key; never commit a service-role key.
6. `npm run dev`, click **Sign in**, open the emailed link in the same browser.

## Data model

- `habits(id, user_id, preset_key, name, category, icon, description, good_day, slip_day, active, created_at)`. Habits are archived (`active=false`), never deleted by the app, so history is preserved.
- `check_ins(habit_id, user_id, date, outcome in good|slip|missed, note, updated_at)`, primary key `(habit_id, date)`. A composite foreign key ties each check-in to a habit owned by the same user.
- Row-level security limits every row to `auth.uid()`. A trigger enforces the five-active-habit cap in the database.
- Rating is never stored: it is derived from check-ins by `src/domain/score.ts` (`good +1`, `slip −1`, `missed` / no record `0`).
- `note` exists in the schema but has no UI yet.
