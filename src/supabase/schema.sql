-- =============================================================================
-- Doctor personal-brand site — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and run it once.
--
-- After running:
--   1. Storage → create a PUBLIC bucket named exactly `media`
--   2. Authentication → Users → Add User (the single owner account for /admin)
--   3. Project Settings → API → copy Project URL, anon key, service_role key
--      into .env.local (and Vercel env vars):
--        NEXT_PUBLIC_SUPABASE_URL=...
--        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
--        SUPABASE_SERVICE_ROLE_KEY=...        (server-only — never in the browser)
-- =============================================================================

-- ------------------------------- TABLES --------------------------------------

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  category text,
  tags text[],
  excerpt text,
  body text,
  reading_time int,
  status text default 'draft', -- draft | published
  published_at timestamptz,
  created_at timestamptz default now()
);
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  album text,
  display_order int default 0,
  created_at timestamptz default now()
);
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_image_url text,
  description text,
  impact_stats jsonb, -- e.g. [{"label": "Lives Impacted", "value": "10,000+"}]
  partners text[],
  status text default 'active',
  created_at timestamptz default now()
);
create table speaking_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  location text,
  cover_image_url text,
  status text default 'upcoming', -- upcoming | past
  booking_link text,
  created_at timestamptz default now()
);
create table media_items (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- video | podcast | tv | interview | publication
  title text not null,
  thumbnail_url text,
  external_url text,
  item_date date,
  created_at timestamptz default now()
);
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  photo_url text,
  quote text not null,
  display_order int default 0
);
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
create table site_settings (
  key text primary key,
  value jsonb
);

-- ------------------------- ROW LEVEL SECURITY --------------------------------

alter table articles enable row level security;
alter table gallery_images enable row level security;
alter table projects enable row level security;
alter table speaking_events enable row level security;
alter table media_items enable row level security;
alter table testimonials enable row level security;
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;
alter table site_settings enable row level security;

-- Public can READ published content
create policy "public read published articles" on articles
  for select using (status = 'published');
create policy "public read gallery" on gallery_images for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read events" on speaking_events for select using (true);
create policy "public read media" on media_items for select using (true);
create policy "public read testimonials" on testimonials for select using (true);
create policy "public read settings" on site_settings for select using (true);

-- Anyone can INSERT a contact message or subscribe (but not read others' data)
create policy "public insert contact" on contact_messages for insert with check (true);
create policy "public insert subscriber" on newsletter_subscribers for insert with check (true);

-- ------------------- ADMIN DASHBOARD ACCESS (signed-in owner) ----------------
-- The admin dashboard at /admin is a browser app authenticated with Supabase
-- Auth, so it uses the anon key + the logged-in session. These policies grant
-- the signed-in owner full access. (The service_role key still bypasses RLS
-- entirely and should only ever be used from a server context — never shipped
-- to the browser.)

create policy "authenticated manage articles" on articles
  for all to authenticated using (true) with check (true);
create policy "authenticated manage gallery" on gallery_images
  for all to authenticated using (true) with check (true);
create policy "authenticated manage projects" on projects
  for all to authenticated using (true) with check (true);
create policy "authenticated manage events" on speaking_events
  for all to authenticated using (true) with check (true);
create policy "authenticated manage media" on media_items
  for all to authenticated using (true) with check (true);
create policy "authenticated manage testimonials" on testimonials
  for all to authenticated using (true) with check (true);
create policy "authenticated manage messages" on contact_messages
  for all to authenticated using (true) with check (true);
create policy "authenticated read subscribers" on newsletter_subscribers
  for select to authenticated using (true);
create policy "authenticated delete subscribers" on newsletter_subscribers
  for delete to authenticated using (true);
create policy "authenticated manage settings" on site_settings
  for all to authenticated using (true) with check (true);

-- ---------------------------- STORAGE POLICIES ------------------------------
-- Run after creating the public `media` bucket in Storage.

create policy "public read media bucket" on storage.objects
  for select using (bucket_id = 'media');
create policy "authenticated upload media bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "authenticated update media bucket" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "authenticated delete media bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
