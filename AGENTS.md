# Agent Instructions

This repository is a controlled CI-provider benchmark.

## Primary goal

Compare providers without changing the workload between providers. Prefer edits to provider entrypoints and provider notes over edits to shared workload code.

## Required workflow

1. Read `START-HERE.md`, `docs/provider-evaluation-runbook.md`, and the selected provider's `README.md`.
2. Run `npm ci`.
3. Run `npm run bench -- --provider <provider> --workload all --scenario <scenario>`.
4. Preserve JSON files from `results/` as CI artifacts.
5. Record cache hits/misses, phase timings, total duration, runner details, and every manual setup step in `providers/<provider>/NOTES.md`.

## Provider changes

- Put provider documentation in `providers/<provider>/README.md`.
- Keep mandatory native entrypoints in their platform-defined locations.
- Call the shared benchmark command; do not duplicate workload logic in CI YAML.
- Pin runtime versions where the provider supports it.
- Do not add secrets or credential values to the repository.

## Experiment hygiene

- Do not compare results from different commits as if they were equivalent.
- Do not change machine size without recording it.
- Do not silently retry failed runs.
- Use a new branch for each scenario and record the commit SHA.
- Prefer five or more repetitions before drawing conclusions.
