create table churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro', 'enterprise')),
  source text not null default 'lumina',
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table churches enable row level security;
