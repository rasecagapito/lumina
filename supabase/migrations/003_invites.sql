create table invites (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'lider', 'membro')),
  token text not null unique,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'expirado')),
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_by uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

create index invites_church_id_idx on invites (church_id);
create index invites_token_idx on invites (token);

alter table invites enable row level security;

create policy "invites_select_admin_lider" on invites
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "invites_insert_admin" on invites
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
