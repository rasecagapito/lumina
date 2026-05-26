create table departments (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  name text not null,
  leader_id uuid references profiles on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create index departments_church_id_idx on departments (church_id);

create table department_members (
  department_id uuid not null references departments on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (department_id, profile_id)
);

alter table departments enable row level security;
alter table department_members enable row level security;

create policy "departments_select" on departments
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "departments_insert_admin" on departments
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "departments_update_admin_lider" on departments
  for update using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "department_members_select" on department_members
  for select using (
    (select church_id from departments where id = department_id)
    = (select church_id from profiles where id = auth.uid())
  );
