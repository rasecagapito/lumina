create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  external_id text not null,
  action text not null check (action in ('created', 'updated', 'skipped')),
  synced_at timestamptz not null default now()
);

create index sync_logs_entity_idx on sync_logs (entity);
create index sync_logs_synced_at_idx on sync_logs (synced_at);

-- No RLS — service-role only access
