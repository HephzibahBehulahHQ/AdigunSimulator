create schema if not exists adigun_simulator_private;
revoke all on schema adigun_simulator_private from public, anon, authenticated;

create table adigun_simulator_private.guest_trials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  expires_at timestamptz not null,
  check (expires_at = started_at + interval '4 minutes')
);

alter table adigun_simulator_private.guest_trials enable row level security;
revoke all on table adigun_simulator_private.guest_trials from public, anon, authenticated;

create function public.adigun_simulator_ensure_guest_trial()
returns table (started_at timestamptz, expires_at timestamptz, server_now timestamptz)
language plpgsql security definer
set search_path = ''
as $$
declare
  guest_id uuid := auth.uid();
  now_at timestamptz := statement_timestamp();
begin
  if guest_id is null or (auth.jwt()->>'is_anonymous') is distinct from 'true' then
    raise exception using errcode = '28000', message = 'An anonymous session is required.';
  end if;

  insert into adigun_simulator_private.guest_trials (user_id, started_at, expires_at)
  values (guest_id, now_at, now_at + interval '4 minutes')
  on conflict (user_id) do nothing;

  return query
    select trial.started_at, trial.expires_at, now_at
    from adigun_simulator_private.guest_trials as trial
    where trial.user_id = guest_id;
end;
$$;

revoke all on function public.adigun_simulator_ensure_guest_trial() from public, anon, authenticated;
grant execute on function public.adigun_simulator_ensure_guest_trial() to authenticated;
