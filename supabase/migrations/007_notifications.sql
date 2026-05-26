create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  profile_id uuid references profiles on delete set null,
  channel text not null check (channel in ('whatsapp', 'email')),
  type text not null check (type in ('invite', 'scale', 'reminder', 'custom')),
  status text not null default 'sent' check (status in ('sent', 'failed', 'delivered')),
  payload jsonb,
  sent_at timestamptz not null default now()
);

create index notification_logs_church_id_idx on notification_logs (church_id);
create index notification_logs_profile_id_idx on notification_logs (profile_id);

alter table notification_logs enable row level security;

create policy "notification_logs_select_admin" on notification_logs
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
