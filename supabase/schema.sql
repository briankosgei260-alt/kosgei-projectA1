create table if not exists public.authorized_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 48),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  status text not null check (status in ('pending', 'approved', 'revoked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  last_seen_at timestamptz
);

create index if not exists authorized_devices_user_status_idx
  on public.authorized_devices (user_id, status);

alter table public.authorized_devices enable row level security;
grant select, insert on public.authorized_devices to authenticated;

drop policy if exists "Users can view their own devices" on public.authorized_devices;
create policy "Users can view their own devices"
  on public.authorized_devices for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can request their own devices" on public.authorized_devices;
create policy "Users can request their own devices"
  on public.authorized_devices for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

create or replace function public.bootstrap_device(p_name text, p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_device_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_name is null or char_length(trim(p_name)) not between 2 and 48 then
    raise exception 'Invalid device name';
  end if;

  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid device token';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(current_user_id::text)
  );

  if exists (
    select 1
    from public.authorized_devices
    where user_id = current_user_id and status = 'approved'
  ) then
    raise exception 'An approved device already exists';
  end if;

  insert into public.authorized_devices (
    user_id, name, token_hash, status, approved_at
  )
  values (
    current_user_id, trim(p_name), p_token_hash, 'approved', now()
  )
  returning id into new_device_id;

  return new_device_id;
end;
$$;

revoke all on function public.bootstrap_device(text, text) from public;
grant execute on function public.bootstrap_device(text, text) to authenticated;

create or replace function public.revoke_device(p_user_id uuid, p_device_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  approved_device_count integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(p_user_id::text)
  );

  select count(*) into approved_device_count
  from public.authorized_devices
  where user_id = p_user_id and status = 'approved';

  if approved_device_count <= 1 then
    return false;
  end if;

  update public.authorized_devices
  set status = 'revoked'
  where id = p_device_id
    and user_id = p_user_id
    and status = 'approved';

  return found;
end;
$$;

revoke all on function public.revoke_device(uuid, uuid) from public;
revoke all on function public.revoke_device(uuid, uuid) from authenticated;
grant execute on function public.revoke_device(uuid, uuid) to service_role;
