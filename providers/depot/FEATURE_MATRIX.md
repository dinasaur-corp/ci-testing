# Depot Feature and Project Support Matrix

Last updated: October 5, 2026.

Legend:

- **Tested**: exercised in `dinasaur404/ci-testing`.
- **Blocked**: attempted but onboarding or repository constraints prevented a valid test.
- **Docs**: supported according to Depot documentation, not yet exercised here.

## Product-mode matrix

| Capability | Depot GitHub Actions runners | Depot CI | Test status |
| --- | --- | --- | --- |
| Workflow control plane | GitHub Actions | Depot | Depot CI local/API tested |
| Workflow syntax | Existing `.github/workflows/*` | GitHub Actions-compatible YAML in `.depot/workflows/*` | Tested for basic steps/actions |
| Adoption change | Install app and change `runs-on` | Run migration and connect Code Access | Org repo created; runner probe blocked pending app installation; CI workflow manually created |
| Push / PR / schedule triggers | Managed by GitHub | Supported subset of GitHub Actions triggers | Branch dispatch blocked by missing repo connection |
| Manual/API runs | GitHub API/CLI | Depot CLI/API and `workflow_dispatch` | Local/API run tested |
| Run local tracked changes | No native GitHub equivalent | `depot ci run` uploads a patch | CLI path tested only with clean tree |
| Linux x86 runners | 2–64 CPU | Depot sandboxes | 2 CPU CI sandbox tested |
| Linux Arm runners | 2–64 CPU | Supported | Docs |
| Windows runners | 2–64 CPU | Compatibility depends on sandbox offering | Docs; note no Hyper-V/Docker on Depot Windows runners |
| macOS runners | M2/M4, 8 CPU | Check CI sandbox availability for target workflow | Docs |
| Matrix jobs | GitHub feature | Supported | Docs |
| Service containers | GitHub feature | Supported | Docs |
| Job containers | GitHub feature | Supported | Docs |
| Reusable workflows | GitHub feature | Same-repository supported; cross-repository unsupported | Docs |
| Artifacts | GitHub artifacts | Compatible artifact actions | Tested |
| Test result visibility | GitHub plus Depot analytics | Depot/GitHub checks | Docs |
| Dependency cache | Depot transparently replaces GitHub cache API backend | Trigger-dependent Depot CI cache behavior | Runner docs; local CI cache unavailable in our test |
| Remote build cache | Bazel, Go, Turbo, Nx, `sccache`, Pants, Gradle | Same Depot Cache integrations | Docs |
| Docker layer cache | Remote BuildKit cache near runner | Depot container-build action/CLI | Docs |
| CPU/memory analytics | Dashboard and API | CLI/API by run/job/attempt | Depot CI tested |
| SSH debugging | Runner-specific GitHub/Depot options | `depot ci ssh` / `--ssh-after-step` | Not yet tested |
| Retry failed step | GitHub/workflow behavior | Depot-specific `retry:` extension | Docs |
| OIDC | GitHub OIDC from GitHub workflow | Depot issuer with job JWT | Docs |
| Private networking | WARP, Tailscale, VPC peering, dedicated infrastructure | Product/plan dependent | Docs |
| Agent API/CLI | GitHub API plus Depot analytics API | Broad Depot CLI/API | Structured status/metrics/artifacts tested |

## Project-type fit

| Project type | Fit | Relevant capabilities | Important caveats | Test status |
| --- | --- | --- | --- | --- |
| Node/npm/pnpm/Yarn | Strong | `setup-node` cache compatibility, larger runners, standard actions | Cache quality still depends on keys and paths | Basic Node tested |
| TypeScript monorepo | Strong | Matrices, large runners, Turbo/Nx/Bazel remote cache | Needs affected-project selection for best cost | Synthetic monorepo tested |
| Browser E2E / Playwright | Strong | Large Linux runners, sharding, browser/dependency cache, artifacts | Browser install size makes cache throughput important | Customer evidence; not benchmarked |
| Docker and multi-platform images | Strong | Remote BuildKit, persistent NVMe layer cache, Arm builders | Separate Depot container-build project/configuration | Docs and customer evidence |
| Microservices monorepo | Strong | Matrix jobs, service containers, shared remote cache | Cache boundaries and fan-out need deliberate design | Docs |
| Database integration tests | Good | Service containers, job containers, private networking | Startup and network behavior need measurement | Not tested |
| CPU-heavy native compilation | Strong | x86/Arm runners up to 64 CPU, `sccache`, Bazel | Cost grows with runner size | Docs; Nominal evidence |
| Windows application | Moderate | Windows Server runners up to 64 CPU | No Hyper-V; Docker-dependent Windows jobs are a poor fit | Docs |
| macOS / Apple build | Moderate to strong | M2/M4 macOS runners | Capacity is less elastic and may queue | Docs |
| Private/internal enterprise build | Strong on higher tiers | Custom images, static egress, VPC peering, WARP/Tailscale | Plan and network setup complexity | Docs |
| GitHub Packages-heavy workflow | Good on runner product; caveat on Depot CI | GitHub runner retains normal GitHub context | Depot CI GitHub App token cannot push/pull GitHub Packages; PAT required | Docs |
| Fork-heavy open source project | Good on runner product; incomplete on Depot CI | GitHub handles fork PRs in runner mode | Depot CI fork-trigger support is planned | Docs |

## Gaps to verify

- Depot Cache cold/warm performance at 100 MB, 1 GB, and multi-GB sizes.
- Exact cache behavior for Depot CI push/PR triggers versus local/API triggers.
- Cost and queue behavior under a burst of parallel jobs.
- SSH, diagnose, retry, cancel, and failed-only rerun behavior.
- Secrets migration and protected-environment behavior.
- Private registries and internal-network connectivity.
- macOS queueing and Windows limitations in a real workflow.
- Cross-repository reusable workflow migration.
