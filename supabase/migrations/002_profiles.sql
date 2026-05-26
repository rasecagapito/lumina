create table profiles (
  id uuid primary key references auth.users on delete cascade,
  church_id uuid not null references churches on delete cascade,
  role text not null check (role in ('admin', 'lider', 'membro')),
  full_name text not null,
  phone text,
  avatar_url text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'visitante')),
  source text not null default 'lumina',
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_church_id_idx on profiles (church_id);
create index profiles_external_id_idx on profiles (external_id) where external_id is not null;

alter table profiles enable row level security;

create policy "profiles_select" on profiles
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_admin" on profiles
  for update using (
    (select role from profiles where id = auth.uid()) = 'admin'
    and church_id = (select church_id from profiles where id = auth.uid())
  );

-- churches_select deferred here because it references profiles (created above)
create policy "churches_select" on churches
  for select using (
    id = (select church_id from profiles where id = auth.uid())
  );
