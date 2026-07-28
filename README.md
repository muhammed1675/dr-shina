# Personal brand site — Dr. Oladeji, MD

A luxury editorial personal-brand site (6 public pages) plus a private, authenticated admin dashboard at `/admin`, wired end-to-end to Supabase. No mock data — every list, form and counter reads and writes real rows.

## Your 3 manual steps

1. **Run the SQL.** Open Supabase → SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql) as-is (tables + Row Level Security + storage policies). Then:
   - Storage → create a **public** bucket named exactly `media`.
   - Authentication → Users → **Add User** to create the single owner login used at `/admin/login`.
2. **Add keys locally.** Copy `.env.example` to `.env.local` and paste the three values from Project Settings → API:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never imported in browser code
   ```
3. **Add the same keys to Vercel** under Settings → Environment Variables, then redeploy.

## Structure

| Path | Purpose |
| --- | --- |
| `pages/` | Public pages: Home, About, Articles (+ `/articles/:slug`), Gallery & Media, Projects & Speaking, Contact |
| `pages/admin/` | Login, dashboard and one management screen per table |
| `components/site/` | Editorial UI: hero, marquee gallery, lightbox, cards, footer, newsletter |
| `components/admin/` | Layout, protected route, data table, form drawer, image upload, confirm dialog |
| `lib/` | Supabase client, auth + settings providers, data hooks, storage upload, formatting |
| `supabase/schema.sql` | Full schema + RLS, copy-paste ready |

## Data flow

- **Public pages** read via `supabase.from(...).select()` through `useSupabaseQuery`, with skeletons, error states and elegant empty states everywhere.
- **Contact form** inserts into `contact_messages`; **newsletter** inserts into `newsletter_subscribers` and turns the unique-email error into a friendly “You’re already subscribed”.
- **Admin** uses Supabase Auth (email/password); `/admin/*` redirects to `/admin/login` without a session. Every list reads live, every form performs real `insert`/`update`, every delete is confirmed first.
- **Image fields** drag-and-drop upload to the public `media` bucket and store the returned public URL in the matching `*_image_url` / `*_url` column.
- **Site Settings** upserts key/value rows in `site_settings`, so hero copy, social links and contact details are editable without a redeploy.

Admin writes are authorised by the signed-in owner session against the `authenticated` RLS policies. The `service_role` key bypasses RLS entirely and must only ever be used from a server context — it is never imported into client code.