create table if not exists public.adigun_simulator_cloud_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id text not null,
  name text not null check (char_length(name) between 1 and 100),
  data jsonb not null check (octet_length(data::text) <= 1500000),
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, document_id)
);

create table if not exists public.adigun_simulator_cloud_revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.adigun_simulator_cloud_projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  version integer not null check (version >= 1),
  name text not null check (char_length(name) between 1 and 100),
  data jsonb not null check (octet_length(data::text) <= 1500000),
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create index if not exists adigun_simulator_cloud_projects_updated_idx
  on public.adigun_simulator_cloud_projects (user_id, updated_at desc);
create index if not exists adigun_simulator_cloud_revisions_project_idx
  on public.adigun_simulator_cloud_revisions (project_id, version desc);

alter table public.adigun_simulator_cloud_projects enable row level security;
alter table public.adigun_simulator_cloud_revisions enable row level security;

revoke all on table public.adigun_simulator_cloud_projects from anon, authenticated;
revoke all on table public.adigun_simulator_cloud_revisions from anon, authenticated;
grant select, insert, update, delete on table public.adigun_simulator_cloud_projects to authenticated;
grant select on table public.adigun_simulator_cloud_revisions to authenticated;

create policy adigun_simulator_cloud_projects_select_owner
  on public.adigun_simulator_cloud_projects for select to authenticated
  using ((select auth.uid()) = user_id);
create policy adigun_simulator_cloud_projects_insert_owner
  on public.adigun_simulator_cloud_projects for insert to authenticated
  with check ((select auth.uid()) = user_id and version = 1);
create policy adigun_simulator_cloud_projects_update_owner
  on public.adigun_simulator_cloud_projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy adigun_simulator_cloud_projects_delete_owner
  on public.adigun_simulator_cloud_projects for delete to authenticated
  using ((select auth.uid()) = user_id);
create policy adigun_simulator_cloud_revisions_select_owner
  on public.adigun_simulator_cloud_revisions for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.enforce_adigun_simulator_cloud_project_limit()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  project_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.user_id::text));
  select count(*) into project_count
    from public.adigun_simulator_cloud_projects
    where user_id = new.user_id;
  if project_count >= 10 then
    raise exception 'Cloud project limit reached (10 per account).' using errcode = 'P0001';
  end if;
  return new;
end
$function$;

create trigger adigun_simulator_cloud_project_limit
  before insert on public.adigun_simulator_cloud_projects
  for each row execute function public.enforce_adigun_simulator_cloud_project_limit();

create or replace function public.version_adigun_simulator_cloud_project()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.user_id is distinct from old.user_id
     or new.id is distinct from old.id
     or new.document_id is distinct from old.document_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Project ownership and identity are immutable';
  end if;
  if new.name is not distinct from old.name and new.data is not distinct from old.data then
    return old;
  end if;
  insert into public.adigun_simulator_cloud_revisions(project_id, user_id, version, name, data)
    values(old.id, old.user_id, old.version, old.name, old.data);
  delete from public.adigun_simulator_cloud_revisions
    where id in (
      select id from public.adigun_simulator_cloud_revisions
      where project_id = old.id
      order by version desc
      offset 5
    );
  new.version := old.version + 1;
  new.updated_at := pg_catalog.now();
  return new;
end
$function$;

create trigger adigun_simulator_cloud_project_version
  before update on public.adigun_simulator_cloud_projects
  for each row execute function public.version_adigun_simulator_cloud_project();

revoke all on function public.enforce_adigun_simulator_cloud_project_limit() from public, anon, authenticated;
revoke all on function public.version_adigun_simulator_cloud_project() from public, anon, authenticated;
