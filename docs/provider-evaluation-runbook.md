# Provider Evaluation Runbook

Follow this document for every provider. Provider-specific setup belongs in `providers/<provider>/README.md`; observations belong in `providers/<provider>/NOTES.md`.

## Rules

- Use the same commit, Node major version, workload command, and comparable machine size.
- Keep provider-specific logic outside `scripts/` and `workloads/`.
- Record every browser-only action, permission request, documentation lookup, error, and retry.
- Save raw provider timing data and `results/*.json` artifacts.
- Use synthetic code and test credentials only.
- Run normal scenarios at least five times before comparing medians or p90s.

## Phase 0: establish the baseline

```bash
npm ci
npm test
npm run bench -- --provider local --workload all --scenario cold
npm run bench -- --provider local --workload all --scenario warm
```

Confirm the cold run reports cache misses and the warm run reports cache hits.

## Phase 1: connect the provider

Follow `providers/<provider>/README.md`. Start a timer before account/repository setup and stop it at the first green hosted run.

Record:

- Time to first green run.
- Number of browser, CLI, and configuration steps.
- Required permissions and credentials.
- Errors and documentation pages needed.
- Whether a coding agent can complete setup without a browser.

## Phase 2: run the standard scenarios

Use a branch named `bench/<provider>/<scenario>` for commit-driven scenarios.

### A. Cold

Clear provider caches if possible, then run:

```bash
npm run bench -- --provider <provider> --workload all --scenario cold
```

### B. Warm

Rerun the same commit without clearing caches:

```bash
npm run bench -- --provider <provider> --workload all --scenario warm
```

### C. One-package source change

```bash
npm run scenario -- source-change
git add workloads/monorepo/packages/package-03/src/value.txt
git commit -m "bench: source change"
git push
```

Verify unaffected package tasks are reused when the provider supports the necessary cache behavior.

### D. Lockfile change

```bash
npm run scenario -- reset
npm run scenario -- lockfile-change
git add package.json package-lock.json
git commit -m "bench: lockfile change"
git push
```

### E. Documentation-only change

```bash
npm run scenario -- reset
npm run scenario -- docs-only
git add docs/scenario-marker.md
git commit -m "bench: docs-only change"
git push
```

Evaluate path filtering and whether expensive work can be skipped.

### F. Failed task and rerun

```bash
npm run scenario -- reset
npm run scenario -- failed-shard
git add workloads/monorepo/packages/package-03/src/value.txt
git commit -m "bench: intentional failure"
git push
```

Measure time to identify the failed unit, inspect logs, and rerun only failed work. The benchmark intentionally exits with status `1` and still writes a result artifact.

### G. Burst and cancellation

Push three small commits quickly. Record queueing, automatic cancellation, wasted compute, and which run ultimately reports status.

After scenario testing, restore the baseline:

```bash
npm run scenario -- reset
```

## Phase 3: evaluate agent experience

Ask a coding agent to perform these operations using only CLI/API access where possible:

1. Start a run for a selected workflow and scenario.
2. Return a structured run ID and URL.
3. Stream or fetch logs.
4. Identify the failed task.
5. Retry only failed work.
6. Cancel a running workflow.
7. Download result artifacts.
8. Report queue, setup, execution, and total duration.

Record missing APIs, browser-only blockers, authentication friction, and the number of agent tool calls.

## Phase 4: summarize

Fill in the provider's `NOTES.md` using `docs/provider-notes-template.md`. Keep raw numbers separate from conclusions.

