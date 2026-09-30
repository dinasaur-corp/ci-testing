# Start Here

This repository is a reusable lab for evaluating one CI provider at a time. You should not need to re-explain the project to a new coding agent.

## The one-sentence agent prompt

Use this for any provider:

> Evaluate `<provider>` using the instructions in `AGENTS.md` and `docs/provider-evaluation-runbook.md`. Start with `providers/<provider>/README.md`, preserve the shared workloads, and record setup friction and benchmark results in `providers/<provider>/NOTES.md`.

For Depot, use:

> Evaluate both Depot CI and Depot-managed GitHub Actions runners using the repository instructions. Keep their results separate, complete both guided tracks in `providers/depot/README.md`, and record setup friction, timings, caching, debugging, and agent-access observations in `providers/depot/NOTES.md`.

## What already exists

- Two provider-neutral workloads: a small Node app and a six-package monorepo.
- A content-addressed task cache that makes cold versus warm behavior visible.
- Standard scenarios for source, lockfile, documentation, and failure changes.
- Native starting configurations for GitHub Actions, CircleCI, GitLab CI, and Depot CI.
- A shared experiment protocol and result format.
- Provider folders where setup instructions and observations live.

## What you do for each provider

1. Create or connect a test account and repository.
2. Follow `providers/<provider>/README.md`.
3. Run the exact scenario list in `docs/provider-evaluation-runbook.md`.
4. Download the provider's timing data and the generated `results/*.json` artifacts.
5. Fill in `providers/<provider>/NOTES.md`.
6. Do not change workload code to make one provider look better.

## First-time local setup

```bash
cd ~/ci-bench
npm ci
npm test
npm run bench -- --provider local --workload all --scenario cold
npm run bench -- --provider local --workload all --scenario warm
```

Before using a hosted provider, create an initial commit and push the repository. The repo is currently initialized locally but has no commit or remote.
