# AdigunSimulator deployment runbook

## Observed production path

The production URL is [adigunsimulator.hephzibahbehulah.com](https://adigunsimulator.hephzibahbehulah.com/). The repository's `CNAME` names that host, and DNS resolves it to `hephzibahbehulahhq.github.io`. The repository's latest successful GitHub deployment observed on 2026-11-03 used environment `github-pages`, ref `main`, commit `3e940fe1ba2b8882a25ebd149477db5604a31bc9`; its deployment status was `success`. The live URL returned HTTP 200 during that check.

The Pages settings were inspected on 2026-11-09: source is **GitHub Actions**, custom domain is the host above, and HTTPS is enforced. Only a verification workflow existed, explaining why merging PR #505 did not publish the new commit. No Pages settings or protections were changed.

The repaired `.github/workflows/ci.yml` runs library validation, the test suite, syntax checks and `npm run build -- <new-output-directory>`. Pull requests validate packaging without deploying. Successful pushes to `main` upload the static artifact and run the dependent `deploy` job in the existing `github-pages` environment with only `pages: write` and `id-token: write`. Pages actions are pinned to their inspected release commits; environment rules remain enforced.

The builder copies committed runtime files from an explicit public-path/extension allowlist, excludes hidden/untracked files and development directories, rejects links and refuses to overwrite existing output. It writes `release.json` containing the exact source commit, allowing live deployment identity verification. The workflow follows the [official GitHub Pages custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Release procedure

1. Keep feature work on its review branch. Do not publish a draft pull request.
2. Before merging, require the current head's library validation, full test suite, and syntax checks to pass. Apply the owner-authorized bounded release decision below. Retain the engineering/model limitations and the independent-review gate for verified-component or hardware/manufacturing claims. GitHub must enforce any configured required reviews/checks.
3. Use the repository's normal GitHub pull-request merge path. Let any configured branch protections and required reviews/checks enforce their rules; do not push directly to `main` or bypass a failed gate.
4. After merge, obtain the new `github-pages` deployment record. Verify its ref is `main`, its commit equals the merged commit, and its status is `success`. Then check the production URL and exercise the released page in a browser. An HTTP 200 alone does not prove the new commit was deployed.
5. If deployment fails or the production page regresses, stop release promotion. Revert the merge through a new commit, wait for the resulting Pages deployment to succeed, and verify the restored page and commit. Record the failed deployment and rollback result in the release notes.

## Owner-authorized release — 2026-11-09

The owner stated that they reviewed the project and explicitly instructed build, merge to main, and deployment through GitHub Actions. This supersedes the earlier instruction to leave PR #505 draft awaiting owner review. Proceed through the normal PR path after exact-head checks, without administrator bypass, force-push or history rewriting. The review and release instruction is recorded in this project's active Codex chat.

This authorization accepts publication of the documented bounded capabilities. It is not a claim of independent laboratory, manufacturing, safety or manufacturer-model certification. No component is promoted to verified by this release; the ledger remains 15 candidates and 0 verified parts toward 1,000. Independent engineering review remains required for such claims and before physical use.

The final merge SHA, main CI, Pages run/deployment identity and live checks are recorded on PR #505 after execution. The earlier successful Pages commit `3e940fe1ba2b8882a25ebd149477db5604a31bc9` is historical evidence only. A release is not reported as deployed until the new commit's Pages result and live page are checked.
