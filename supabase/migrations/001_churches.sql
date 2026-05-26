create table churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  source text not null default 'lumina',
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table churches enable row level security;

-- Only profiles belonging to this church can read it
create policy "churches_select" on churches
  for select using (
    id = (select church_id from profiles where id = auth.uid())
  );
