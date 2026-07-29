-- =============================================================================
-- Rabbit Farm module — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and run it ONCE.
-- Safe to re-run: everything uses "if not exists" / "drop policy if exists".
-- =============================================================================

-- ------------------------------- TABLES --------------------------------------

-- Breeds / stock available on the farm
create table if not exists rabbit_breeds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  description text,
  price text,                       -- free text, e.g. "₦15,000 per kit"
  availability text default 'available',  -- available | limited | sold_out
  display_order int default 0,
  created_at timestamptz default now()
);

-- Photo gallery for the farm (separate from the main site gallery)
create table if not exists rabbit_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  album text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Farm journal / blog posts
create table if not exists rabbit_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  excerpt text,
  body text,
  status text default 'draft',      -- draft | published
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Enquiries submitted from the rabbit farm page
create table if not exists rabbit_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest text,                    -- e.g. "Buy rabbits", "Training", "Partnership"
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------- GRANTS --------------------------------------

grant select on rabbit_breeds    to anon, authenticated;
grant select on rabbit_gallery   to anon, authenticated;
grant select on rabbit_posts     to anon, authenticated;
grant insert on rabbit_enquiries to anon, authenticated;
grant select, insert, update, delete on rabbit_breeds    to authenticated;
grant select, insert, update, delete on rabbit_gallery   to authenticated;
grant select, insert, update, delete on rabbit_posts     to authenticated;
grant select, insert, update, delete on rabbit_enquiries to authenticated;
grant all on rabbit_breeds, rabbit_gallery, rabbit_posts, rabbit_enquiries to service_role;

-- ------------------------- ROW LEVEL SECURITY --------------------------------

alter table rabbit_breeds    enable row level security;
alter table rabbit_gallery   enable row level security;
alter table rabbit_posts     enable row level security;
alter table rabbit_enquiries enable row level security;

drop policy if exists "public read rabbit breeds"  on rabbit_breeds;
drop policy if exists "public read rabbit gallery" on rabbit_gallery;
drop policy if exists "public read rabbit posts"   on rabbit_posts;
drop policy if exists "public insert rabbit enquiry" on rabbit_enquiries;

create policy "public read rabbit breeds"  on rabbit_breeds  for select using (true);
create policy "public read rabbit gallery" on rabbit_gallery for select using (true);
create policy "public read rabbit posts"   on rabbit_posts   for select using (status = 'published');
create policy "public insert rabbit enquiry" on rabbit_enquiries for insert with check (true);

drop policy if exists "authenticated manage rabbit breeds"    on rabbit_breeds;
drop policy if exists "authenticated manage rabbit gallery"   on rabbit_gallery;
drop policy if exists "authenticated manage rabbit posts"     on rabbit_posts;
drop policy if exists "authenticated manage rabbit enquiries" on rabbit_enquiries;

create policy "authenticated manage rabbit breeds" on rabbit_breeds
  for all to authenticated using (true) with check (true);
create policy "authenticated manage rabbit gallery" on rabbit_gallery
  for all to authenticated using (true) with check (true);
create policy "authenticated manage rabbit posts" on rabbit_posts
  for all to authenticated using (true) with check (true);
create policy "authenticated manage rabbit enquiries" on rabbit_enquiries
  for all to authenticated using (true) with check (true);

-- ------------------------- EDITABLE PAGE COPY --------------------------------
-- Hero headline/subtitle + farm intro are editable in Admin → Site Settings.

insert into site_settings (key, value) values
  ('rabbit_hero', '{"headline":"Oladeji Rabbit Farm — Protein, Purpose & Prosperity","subtitle":"A working rabbitry built on the same principle as the clinic: healthy communities start with healthy nutrition and honest enterprise."}'::jsonb)
on conflict (key) do nothing;
