# AdigunSimulator cloud project data

## User choice and data

- Email is used by Supabase Auth for sign-in and password recovery.
- A circuit document is sent to Supabase only after a signed-in user chooses **Save current project to cloud**, reviews the disclosure, and confirms **Save project to cloud**.
- Opening cloud projects and versions reads data; it does not upload local edits. After opening an older version, it is only a local working copy until the user explicitly saves it.
- Guest projects and browser-local saves remain available. There is no background upload, cloud autosave, or AI processing of cloud documents.
- Cloud project names, the native project JSON, and revision snapshots are stored in simulator-specific tables in the existing shared Supabase project. The application does not write project contents to its own logs.

## Access, retention, and deletion

- Row Level Security requires `auth.uid() = user_id` for cloud project reads and writes. Revisions are owner-readable and created by a database trigger; browser clients cannot write revisions directly. Anonymous clients receive no table privileges.
- Each account may store up to 10 projects. The browser rejects project JSON above 1.4 MB; the database also rejects document JSON above 1.5 MB. The database trigger retains at most the 5 newest prior versions per project.
- Projects and revisions remain until the owner deletes the project. Deleting a project permanently removes its revisions; it does not delete the local browser copy. Deleting the Auth user cascades to cloud projects and revisions.
- The largest database allowance is approximately 90 MB per account (10 projects × 1.5 MB × current document plus 5 revisions). Real documents are usually smaller. This shares the existing Supabase Free project quota with other company applications; this feature does not change billing tiers. The project owner must monitor aggregate storage and usage.
- Provider-managed backups and their deletion windows are outside the app's controls. Users should retain a native project file for independent recovery.

## Incident and operational limits

- The UI shows generic cloud errors and does not place project JSON or database responses in application logs. The application has no automated breach alert or incident-notification workflow.
- For suspected unauthorized access, the operator must use the Supabase dashboard to restrict the affected account or Auth access, review available Auth/database security logs and advisories, and notify affected users through the organization's approved support channel. This is a manual response procedure, not an automated control.
- Production rollout completed on 2026-11-12: migration `opt_in_cloud_projects` was applied to the shared Supabase project before deployment; both simulator-namespaced tables have RLS enabled with owner policies, and the production release marker reports commit `d498597`. Automated checks cover the 10-project/5-prior-version limits and account/project deletion cascades. Broader authenticated browser verification remains open.
