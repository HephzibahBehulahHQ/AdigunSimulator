-- Preserve existing owner policies and require a verified Simulator session in addition.
create policy adigun_simulator_verified_cloud_project_session
on public.adigun_simulator_cloud_projects
as restrictive for all to authenticated
using ((select adigun_simulator_private.has_verified_session()))
with check ((select adigun_simulator_private.has_verified_session()));

create policy adigun_simulator_verified_cloud_revision_session
on public.adigun_simulator_cloud_revisions
as restrictive for all to authenticated
using ((select adigun_simulator_private.has_verified_session()))
with check ((select adigun_simulator_private.has_verified_session()));
