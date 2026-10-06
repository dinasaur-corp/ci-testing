# Depot Competitive Analysis and Test Report

Last updated: October 5, 2026.

## Executive summary

Depot has two products that should be evaluated separately:

1. **Depot GitHub Actions runners** keep GitHub Actions as the control plane and replace only the runner and cache backend.
2. **Depot CI** replaces the CI orchestrator while retaining substantial GitHub Actions YAML compatibility.

The strongest competitive advantage is incremental adoption. A GitHub Actions customer can install the Depot GitHub App and change only `runs-on` to try faster compute and Depot Cache. Depot CI offers a larger migration, but keeps familiar workflow syntax and adds a strong CLI/API-first debugging loop.

Our current testing validates Depot CI local/API execution, CLI ergonomics, structured metrics, artifacts, and the GitHub-hosted baseline. It does **not** yet provide a fair GitHub-hosted-versus-Depot-runner performance comparison because the test repository is owned by a personal GitHub account, while Depot's runner onboarding requires a GitHub organization.

The machine-readable aggregate is stored in `providers/depot/data/2026-10-05-benchmark-summary.json`.

## What we tested

- Repository: `dinasaur404/ci-testing`
- Commit: `32135a687050d99ae2e544baae58e876de0a08c5`
- Date: October 5, 2026
- Workload: small Node workload plus six-package synthetic monorepo
- Tasks per run: 14 build/test tasks
- GitHub runner: `ubuntu-latest`, observed as 4 CPU, Node `22.23.3`
- Depot CI sandbox: `depot-ubuntu-24.04`, documented as 2 CPU / 8 GB, Node `22.23.3`

### GitHub-hosted baseline

Three cold/warm pairs were dispatched through GitHub Actions against the same commit.

| Scenario | Runs | Median queue | Median job | Median workflow wall | Median workload | Cache result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Cold | 3 | 4s | 8s | 26s | 859ms | 0 hits / 14 misses |
| Warm | 3 | 5s | 8s | 22s | 50ms | 14 hits / 0 misses |

One warm run had a 39-second queue outlier and 55-second total wall time. This small sample is useful for harness validation, but insufficient for a stable p90.

Runs:

- Cold: `37332342966`, `37332559033`, `37332685671`
- Warm: `37332416281`, `37332620818`, `37332756057`

### Depot CI local/API runs

Three clean-checkout runs were started with:

```bash
depot ci run \
  --org p1ghqwc0f7 \
  --workflow .depot/workflows/benchmark.yml \
  --job benchmark \
  --follow
```

| Runs | Median run queue | Median job queue | Median job | Median end-to-end run | Median workload | Cache result |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 3 | 399ms | 2.87s | 8.23s | 14.42s | 453ms | 0 hits / 14 misses |

Runs: `4k0m1plbrj`, `w24q5thbx4`, `z57wpqhj10`.

Median observed utilization was approximately 31% CPU and 6% memory. The workload is therefore too small to evaluate large-runner efficiency or cost.

### Important cache limitation

Every local/API run emitted:

```text
The runner was not able to contact the cache service. Caching will be skipped.
Event Validation Error: The event type api is not supported because it's not tied to a branch or tag ref.
```

Repeated local runs remained cache-cold. This means `depot ci run` is useful for testing local changes and agent/debugging experience, but our current workflow cannot use it to benchmark Depot Cache.

A branch-based `depot ci dispatch` attempt also failed:

```text
Workflow 'benchmark.yml' not found or does not have workflow_dispatch trigger.
```

The workflow exists and declares `workflow_dispatch`, but the repository is not registered through Depot Code Access. Installing the Depot GitHub App and connecting an organization-owned repository is the next onboarding step.

## What the numbers do and do not show

The Depot workload process was roughly twice as fast as the GitHub-hosted cold workload process in this synthetic test, despite the configured Depot sandbox having fewer CPUs. That is interesting, but it is **not a defensible provider benchmark yet** because:

- The workload is under one second and startup dominates total time.
- The runner sizes are not matched: observed GitHub 4 CPU versus Depot 2 CPU.
- We tested Depot CI, not Depot's GitHub Actions runner product.
- GitHub restored cache entries; Depot local/API runs could not access the cache service.
- Three repetitions are enough to validate the harness, not enough for p90 or cost conclusions.

## Developer experience findings

### Good

- The Depot CLI was already installed and authentication completed through a browser approval flow.
- `depot ci run --follow` produced a simple local-to-remote execution loop.
- `--job benchmark` allowed running only one job.
- Logs streamed directly to the terminal.
- `depot ci status`, `depot ci metrics`, and `depot ci artifacts` returned structured JSON.
- Artifacts uploaded successfully through an unchanged `actions/upload-artifact` step.
- CPU and memory metrics were available by run, workflow, job, and attempt.
- The GitHub Actions-compatible YAML ran without rewriting the workload steps.

### Friction

- Browser approval was required for initial CLI authentication.
- A local/API workflow can run before the repository is fully connected, but branch dispatch cannot. The difference is not obvious until dispatch fails.
- Local/API runs skipped the cache service, preventing a realistic warm-cache comparison.
- The runner product cannot be tested from the current personal-account repository; organization-owner access and GitHub App installation are required.
- The Depot CI artifact action produced GitHub-style artifact URLs and large numeric run IDs, while Depot's own run ID is a shorter opaque identifier. This creates two identifiers to correlate.

## Agent experience findings

Depot CI is strong for agent-operated workflows after initial account setup:

- Start and follow a run from the CLI.
- Request JSON status and metrics.
- List and download artifacts.
- Fetch logs and summaries.
- Cancel, retry, rerun, diagnose, and SSH through dedicated commands.
- Run against local tracked changes without pushing.

Initial authentication and GitHub App installation remain browser-dependent. An agent can operate the system after those connections exist, but cannot independently complete the entire first-time onboarding flow in our current environment.

## Customer evidence

### Ploy

- Most jobs remain GitHub Actions workflows but execute on Depot.
- They adopted Depot after reaching GitHub Actions usage limits and because it was less expensive at the time.
- They use 4- and 8-CPU runners depending on workload.
- They cache Chromium for Playwright and use Depot's container-build caching.
- Internal source: `../ci-examples/customer-call-notes/ploy.md`.

### Nominal

- GitHub Actions remains the workflow engine and jobs execute on large Depot Ubuntu runners.
- They prefer buying faster compute over spending several engineering days optimizing every workload.
- Internal notes estimate approximately $130/month for Depot and $1,300/month for GitHub Actions.
- They identified strong caching and high-performance runners as requirements for a Cloudflare alternative.
- Internal source: `Documents/Codex/2026-09-30/take/work/ci-examples/customer-call-notes/nominal.md`.

## Recommended next benchmarks

### 1. Complete the fair runner comparison

- Use an organization-owned GitHub repository.
- Install and authorize the Depot GitHub App.
- Compare `ubuntu-latest` with `depot-ubuntu-24.04-4` so both have four CPUs.
- Run at least five repetitions; ten is preferable for queue variance.
- Record queue, startup, checkout, cache restore, install, workload, cache save, artifact, total wall, and cost.

### 2. Add representative workloads

| Workload | What it tests | Customer relevance |
| --- | --- | --- |
| Small Node app | Fixed overhead and startup | Every customer |
| TypeScript monorepo | Fan-out, path filtering, task cache | Ploy, Nominal, Stratus |
| Playwright in 4–8 shards | Browser setup, artifacts, parallelism | Ploy, Stratus |
| Docker multi-stage build | BuildKit cache and registry transfer | Ploy |
| Postgres service test | Service containers and networking | Typical application CI |
| CPU-heavy compile | Runner generation and scaling | Nominal's large-runner strategy |
| 100 MB / 1 GB cache | Restore/save throughput and break-even point | Cache-sensitive monorepos |

### 3. Test change scenarios

- Same commit warm rerun.
- One-package source change.
- Lockfile change.
- Documentation-only change.
- Failed shard and retry-only-failed.
- Three rapid pushes and cancellation.
- Pull request from an untrusted fork.

### 4. Test DX and AX explicitly

- Time from account creation to first green run.
- Number of browser-only and organization-owner steps.
- Migration accuracy for a real GitHub Actions workflow.
- Local-change run, SSH debugging, diagnosis, retry, rerun, cancel, and artifact download.
- API coverage and whether outputs are structured enough for agents.

## Product takeaways for Cloudflare managed CI

- Provide an incremental runner-only path before asking customers to migrate orchestration.
- Make onboarding as small as connecting the repository and changing one runner label.
- Preserve existing cache actions while transparently improving the backend.
- Expose queue, CPU, memory, cache, cost, and failure data through both UI and API.
- Support a local-change-to-remote-run loop without requiring commits or pushes.
- Keep browser-only setup limited to the initial trust/authorization step.
- Clearly distinguish runner mode, full CI mode, and cache behavior for each trigger type.

## Official sources

- Runner types: https://depot.dev/docs/github-actions/runner-types
- GitHub Actions runner quickstart: https://preview.depot.dev/docs/github-actions/quickstart
- GitHub Actions cache integration: https://depot.dev/docs/cache/integrations/github-actions
- GitHub Actions metrics/API: https://depot.dev/docs/github-actions/observability/github-actions-metrics and https://depot.dev/docs/api/github-actions-api
- Depot CI compatibility: https://depot.dev/docs/ci/compatibility
- Depot CI local runs: https://depot.dev/resources/guides/can-i-run-github-actions-workflows-locally-before-pushing
- Depot CI API: https://depot.dev/docs/api/ci/reference
- OIDC: https://depot.dev/docs/ci/oidc
- Docker cache: https://depot.dev/resources/guides/how-can-i-share-a-docker-layer-cache-across-github-actions-jobs
