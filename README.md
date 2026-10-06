# CI Provider Benchmark Kit

A portable repo for comparing CI developer experience, agent experience, runtime, caching, and failure handling across providers.

**If this is your first time here, read `START-HERE.md`.** It contains the repeatable provider workflow and a one-sentence prompt you can give any coding agent.

The repo keeps **workloads and benchmark commands provider-neutral**. Provider-specific files only install Node, restore caches, call the same command, and upload `results/`.

## Start here

```bash
cd ~/ci-bench
npm install
npm run bench -- --provider local --workload all --scenario cold
npm run bench -- --provider local --workload all --scenario warm
```

Results are JSON files in `results/`. The second run should report more task-cache hits.

## Layout

```text
.github/workflows/benchmark.yml  GitHub Actions entrypoint
.github/workflows/benchmark-depot-runner.yml  Depot runner entrypoint
.github/workflows/benchmark-namespace-runner.yml  Namespace runner entrypoint
.circleci/config.yml             CircleCI entrypoint
.gitlab-ci.yml                   GitLab CI entrypoint
.depot/workflows/benchmark.yml   Depot CI entrypoint
providers/                       Provider setup notes and evaluation checklists
workloads/small-node/            Small repo / fixed-overhead workload
workloads/monorepo/              Six-package monorepo / fan-out workload
scripts/                         Shared runner, cache, and scenario tools
results/                         Machine-readable benchmark output
```

Some CI systems require configuration at a fixed path, so native entrypoints live at the repository root. All provider notes are grouped under `providers/`.

## Benchmark commands

```bash
# Run one workload
npm run bench -- --provider circleci --workload small-node --scenario cold

# Run both workloads three times each
npm run bench:matrix -- --provider local --scenarios cold,warm --runs 3

# Create a commit-sized scenario change
npm run scenario -- source-change
npm run scenario -- docs-only
npm run scenario -- lockfile-change

# Restore scenario files to their baseline values
npm run scenario -- reset
```

Supported workloads: `small-node`, `monorepo`, and `all`.

Suggested scenarios:

- `cold`: clear provider caches before the run.
- `warm`: rerun the same commit with caches restored.
- `source-change`: change one monorepo package.
- `lockfile-change`: invalidate dependency caches.
- `docs-only`: evaluate path filtering and skipped work.
- `failed-shard`: introduce a failure and evaluate rerun ergonomics.
- `burst`: push several commits quickly and evaluate cancellation and queueing.

## Put it on a provider

### GitHub Actions

```bash
git remote add origin git@github.com:YOUR_ORG/ci-bench.git
git push -u origin main
```

The workflow runs on pushes and pull requests and can also be started manually with workload and scenario inputs.

### CircleCI

Connect the same GitHub repository in CircleCI. It automatically discovers `.circleci/config.yml`.

### GitLab CI

Push a mirror to GitLab. GitLab automatically discovers `.gitlab-ci.yml`.

### Depot and Namespace

These can be tested as GitHub Actions runner replacements. Follow `providers/depot/README.md` and `providers/namespace/README.md` after creating trial credentials.

### RWX and Cloudflare managed CI

The provider folders contain integration checklists. Add native config only after confirming the current product syntax instead of copying an outdated example.

## Fair-test rules

1. Pin the same commit and Node major version.
2. Use comparable CPU and memory sizes.
3. Keep benchmark commands identical across providers.
4. Run each scenario at least five times; compare median and p90.
5. Separate queue time, setup time, workload time, cache restore/save time, and total wall time.
6. Record configuration effort, docs lookups, failed attempts, rerun steps, and API/CLI quality.
7. Never put real customer code or production credentials in this repo.

See `docs/experiment-plan.md` and `docs/result-schema.md` for the full protocol.
