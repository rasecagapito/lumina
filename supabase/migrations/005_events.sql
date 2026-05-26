create table events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  recurrence jsonb,
  created_by uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

create index events_church_id_idx on events (church_id);
create index events_starts_at_idx on events (starts_at);

alter table events enable row level security;

create policy "events_select" on events
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "events_insert_admin_lider" on events
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "events_update_admin_lider" on events
  for update using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "events_delete_admin" on events
  for delete using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
