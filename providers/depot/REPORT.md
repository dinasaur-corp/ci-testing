# Depot Competitive Analysis and Test Report

Last updated: October 6, 2026.

## Executive summary

Depot has two products that should be evaluated separately:

1. **Depot GitHub Actions runners** keep GitHub Actions as the control plane and replace only the runner and cache backend.
2. **Depot CI** replaces the CI orchestrator while retaining substantial GitHub Actions YAML compatibility.

The strongest competitive advantage is incremental adoption. A GitHub Actions customer can install the Depot GitHub App and change only `runs-on` to try faster compute and Depot Cache. Depot CI offers a larger migration, but keeps familiar workflow syntax and adds a strong CLI/API-first debugging loop.

Our current testing validates Depot CI local/API execution, CLI ergonomics, structured metrics, artifacts, and a five-pair GitHub-hosted baseline. The organization-owned repository is now ready, but the Depot GitHub App has not yet been installed for `dinasaur-corp`, so the fair GitHub-hosted-versus-Depot-runner comparison remains pending.

Machine-readable aggregates are stored in:

- `providers/depot/data/2026-10-05-benchmark-summary.json`
- `providers/depot/data/2026-10-06-org-github-baseline.json`

## What we tested

- GitHub baseline repository: `dinasaur-corp/ci-testing`
- GitHub baseline commit: `53bc0de9de95b24f266bc2066dc3ca60f54603aa`
- Depot CI local/API repository: `dinasaur404/ci-testing`
- Depot CI local/API commit: `32135a687050d99ae2e544baae58e876de0a08c5`
- Dates: October 5–6, 2026
- Workload: small Node workload plus six-package synthetic monorepo
- Tasks per run: 14 build/test tasks
- GitHub runner: `ubuntu-latest`, observed as 4 CPU, Node `22.23.3`
- Depot CI sandbox: `depot-ubuntu-24.04`, documented as 2 CPU / 8 GB, Node `22.23.3`

### GitHub-hosted baseline

Five cold/warm pairs were dispatched through GitHub Actions against the same commit in the organization repository.

| Scenario | Runs | Median queue | p90 queue | Median job | p90 job | Median wall | p90 wall | Median workload | Cache result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Cold | 5 | 5s | 8s | 9s | 16s | 14s | 24s | 810ms | 0 hits / 14 misses |
| Warm | 5 | 4s | 4s | 8s | 12s | 13s | 17s | 31ms | 14 hits / 0 misses |

This five-run sample is sufficient for an initial p90 but remains too small for high-confidence cost or reliability conclusions.

Runs:

- Cold: `37484062213`, `37484155486`, `37484421497`, `37484531531`, `37484644564`
- Warm: `37484109873`, `37484375071`, `37484478049`, `37484600404`, `37484689779`

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

The workflow exists and declares `workflow_dispatch`, but the original personal repository was not registered through Depot Code Access.

The organization repository is now available and a Depot runner workflow was dispatched as GitHub run `37472043428`. It remained queued without a matching runner for more than 30 seconds and was cancelled. This confirms that installing the Depot GitHub App for `dinasaur-corp` is the remaining runner-onboarding step.

## What the numbers do and do not show

The Depot workload process was roughly twice as fast as the GitHub-hosted cold workload process in this synthetic test, despite the configured Depot sandbox having fewer CPUs. That is interesting, but it is **not a defensible provider benchmark yet** because:

- The workload is under one second and startup dominates total time.
- The runner sizes are not matched: observed GitHub 4 CPU versus Depot 2 CPU.
- We tested Depot CI, not Depot's GitHub Actions runner product.
- GitHub restored cache entries; Depot local/API runs could not access the cache service.
- Five GitHub repetitions and three Depot CI repetitions are enough for an initial directional comparison, not enough for cost conclusions.

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
- The runner product now has an organization-owned repository, but GitHub App installation remains required.
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

- Install and authorize the Depot GitHub App for `dinasaur-corp/ci-testing`.
- Compare `ubuntu-latest` with `depot-ubuntu-24.04-4` so both have four CPUs.
- Run five cold/warm pairs; ten is preferable for queue variance after the first comparison.
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
