create table scales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  department_id uuid references departments on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create index scales_event_id_idx on scales (event_id);

create table scale_slots (
  id uuid primary key default gen_random_uuid(),
  scale_id uuid not null references scales on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'recusado', 'substituido')),
  notified_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index scale_slots_scale_id_idx on scale_slots (scale_id);
create index scale_slots_profile_id_idx on scale_slots (profile_id);

alter table scales enable row level security;
alter table scale_slots enable row level security;

create policy "scales_select" on scales
  for select using (
    (select church_id from events where id = event_id)
    = (select church_id from profiles where id = auth.uid())
  );

create policy "scale_slots_select" on scale_slots
  for select using (
    (select church_id from events e
      join scales s on s.event_id = e.id
      where s.id = scale_id limit 1)
    = (select church_id from profiles where id = auth.uid())
  );

create policy "scale_slots_update_self" on scale_slots
  for update using (
    profile_id = auth.uid()
  )
  with check (
    status in ('confirmado', 'recusado')
  );
