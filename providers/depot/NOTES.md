# Depot Evaluation Notes

## Run identity

- Provider: Depot
- Product/mode: Depot CI / Depot GitHub runner
- Evaluation date: 2026-10-05
- Repository URL: `https://github.com/dinasaur404/ci-testing`
- Commit SHA: `32135a687050d99ae2e544baae58e876de0a08c5`
- Runner label: `depot-ubuntu-24.04-4` for the pending runner comparison; `depot-ubuntu-24.04` for completed Depot CI local/API runs.
- CPU / memory / architecture: Pending runner comparison: 4 CPU / 16 GB / x86_64. Completed Depot CI runs: 2 CPU / 8 GB / x86_64.
- Region, if known: Not exposed in collected run metadata.
- Pricing plan: Trial/test organization; exact billing not captured.

## Setup experience

- Start time: Not timed from account creation.
- First green time: Initial Depot CI run completed on 2026-09-30.
- Total minutes: Not comparable because the CLI was already installed.
- Browser-only steps: Approve `depot login`; GitHub App installation remains required for runner mode and branch-triggered Depot CI.
- CLI steps: `depot login`, `depot ci run`, `depot ci status`, `depot ci metrics`, and `depot ci artifacts`.
- Permissions requested:
- Credentials or identity model:
- Errors and retries: Local/API runs skipped the cache service. `depot ci dispatch` failed because the workflow was not registered through Depot Code Access.
- Documentation used: Depot runner, cache, CI compatibility, local-run, API, OIDC, and container-build documentation.

## Scenario results

### Depot CI

| Scenario | Run ID | Queue | Setup | Workload | Total | Cache hits/misses | Cost | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Cold/local API | `4k0m1plbrj`, `w24q5thbx4`, `z57wpqhj10` | 399ms median run queue | 2.87s median job queue | 453ms median workload | 14.42s median run | 0/14 each | Not captured | Cache service unavailable for API trigger |
| Warm | Blocked | | | | | | | Branch dispatch requires connected/registered repository |
| Source change | | | | | | | | |
| Lockfile change | | | | | | | | |
| Docs only | | | | | | | | |
| Failed task | | | | | | | | |
| Burst | | | | | | | | |

### Depot GitHub runner

| Scenario | GitHub run ID | Queue | Setup | Workload | Total | Cache hits/misses | Cost | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Cold | | | | | | | | |
| Warm | | | | | | | | |
| Source change | | | | | | | | |
| Lockfile change | | | | | | | | |
| Docs only | | | | | | | | |
| Failed task | | | | | | | | |
| Burst | | | | | | | | |

## Depot-specific checks

### Depot CI

- `depot ci run` with local changes: Clean-checkout path tested; uncommitted patch behavior remains to test.
- `--follow` log streaming: Tested successfully.
- `--ssh` / `--ssh-after-step` debugging:
- Single-job execution: Tested with `--job benchmark`.
- Structured CLI output: JSON status, metrics, workflow lists, and artifact metadata tested.
- Retry and cancellation:
- Artifact retrieval: Listing tested; artifacts uploaded successfully. Download command remains to test.
- CPU/memory metrics: Tested by run. Median observed ~31% CPU and ~6% memory.
- API completeness:
- GitHub checks/status reporting:

### Depot GitHub runner

- Existing Actions workflow compatibility: Workflow prepared but runner path blocked by personal-account repository.
- Runner startup time:
- GitHub rerun/cancel behavior:
- Depot cache visibility:
- Depot runner analytics:
- Depot runner API:
- GitHub App installation friction:

## Developer experience

- Configuration clarity: Basic workflow steps required no rewrite; product-mode differences need clearer onboarding cues.
- Log quality: Strong terminal streaming with grouped action output.
- Cache visibility: Clear warning when unavailable, but local-run limitation was unexpected.
- Rerun granularity:
- Debugging options:
- Artifact/test reporting:
- Biggest delight: Fast CLI loop plus structured status/metrics/artifact APIs.
- Biggest frustration: Local run succeeded before repository connection, while branch dispatch later failed; runner testing requires an organization repository.

## Agent experience

- Setup possible without browser: No. Initial login and GitHub App authorization require browser interaction.
- Structured start/status/log/cancel/retry APIs: Start, status, metrics, logs, and artifact listing are available; cancel/retry not yet exercised.
- Authentication/scoping: Depot CLI user token and organization ID; GitHub App required for repository event integration.
- Agent tool calls required:
- Agent failure modes:

## Conclusions

- Best use cases: GitHub Actions teams seeking faster compute/cache with minimal migration; agent-driven CI debugging; monorepos and Docker-heavy builds.
- Poor fit: Personal GitHub repositories for Depot runner onboarding; Windows jobs that require Hyper-V/Docker; Depot CI workflows dependent on unsupported GitHub-only features.
- Features Cloudflare managed CI should copy: One-label runner adoption, transparent cache backend, local-change remote runs, CLI/API parity, and resource analytics.
- Features Cloudflare managed CI should improve: Make trigger/cache behavior explicit and allow a complete first-run path without ambiguous repository-registration states.
- Open questions: Fair runner performance/cost, branch-trigger cache performance, private-network setup, retry/SSH UX, and large-cache throughput.
