# AdigunSimulator deployment runbook

## Observed production path

The production URL is [adigunsimulator.hephzibahbehulah.com](https://adigunsimulator.hephzibahbehulah.com/). The repository's `CNAME` names that host, and DNS resolves it to `hephzibahbehulahhq.github.io`. The repository's latest successful GitHub deployment observed on 2026-11-03 used environment `github-pages`, ref `main`, commit `3e940fe1ba2b8882a25ebd149477db5604a31bc9`; its deployment status was `success`. The live URL returned HTTP 200 during that check.

The only checked-in workflow is `.github/workflows/ci.yml`; it runs library validation, the test suite, and syntax checks. It does not deploy. Production publishing is handled by the repository's GitHub Pages deployment associated with `main`.

## Release procedure

1. Keep feature work on its review branch. Do not publish a draft pull request.
2. Before merging, require the current head's library validation, full test suite, and syntax checks to pass. Complete the independent electrical review required by `DELIVERY_GATES.md` for every new simulator model and every part promoted to verified. Confirm the deployment, rollback, and monitoring approvals required by that document.
3. Use the repository's normal GitHub pull-request merge path. Let any configured branch protections and required reviews/checks enforce their rules; do not push directly to `main` or bypass a failed gate.
4. After merge, obtain the new `github-pages` deployment record. Verify its ref is `main`, its commit equals the merged commit, and its status is `success`. Then check the production URL and exercise the released page in a browser. An HTTP 200 alone does not prove the new commit was deployed.
5. If deployment fails or the production page regresses, stop release promotion. Revert the merge through a new commit, wait for the resulting Pages deployment to succeed, and verify the restored page and commit. Record the failed deployment and rollback result in the release notes.

## Current release state checked 2026-11-09

- PR #505 is a draft on `codex/rl-transient-acceptance` with no submitted reviews; its implementation head `e94b3e5573d5f72b54c4c47bec12f10a10390313` is not deployed.
- GitHub Actions run #1255 passed for that head. Local validation recorded 380 tests, `npm run check`, `npm run validate:library`, and `git diff --check`. The subsequent merge of the owner's requirements/reference updates from `main` needs matching-head CI; consult PR #505 for its final commit and checks.
- GitHub Pages deployment `7504597626` still identifies `main` commit `3e940fe1ba2b8882a25ebd149477db5604a31bc9`, with status `success`. The live URL returned HTTP 200 on 2026-11-09. The newer `main` head `d5e2ae5e7ea2c6f8b0d1fe590e1533174e462f66` contains specification/reference updates; neither that head nor the feature branch is established as deployed by the existing deployment record.
- The digital event engine includes ideal active-high 2-to-4 decoder and 4-to-1 multiplexer models with zero propagation delay; it does not model device-specific thresholds, timing, loading, or analog behavior. These generic models still require the independent electrical review above before release.
- The parts ledger contains 15 candidates and 0 verified parts; candidates do not count toward the 1,000-part target.
- Do not infer that the draft is releasable from its passing checks or from the currently healthy production URL.


