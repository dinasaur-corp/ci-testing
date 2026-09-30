# Experiment plan

## Questions

- How long does a new user or coding agent take to reach a first green run?
- How much wall time is queueing, environment startup, checkout, dependency setup, workload execution, and artifact upload?
- What happens on exact cache hits, partial hits, misses, and concurrent cache writes?
- Can a user rerun one failed task or shard without repeating successful work?
- Can an agent configure, trigger, inspect, cancel, and rerun CI using structured APIs or CLIs?
- How do logs, previews, artifacts, secrets, identity, and local debugging feel?

## Standard experiment

1. Fork or mirror the same commit to each provider.
2. Record account setup time and every manual step.
3. Run a cold build after deleting provider and task caches.
4. Rerun without changes for a warm build.
5. Apply `source-change`, commit it, and run again.
6. Apply `lockfile-change`, commit it, and run again.
7. Apply `docs-only` and verify whether expensive work is skipped.
8. Create a controlled failure and measure diagnosis plus rerun effort.
9. Push several updates rapidly and inspect queueing and cancellation.
10. Repeat normal timing scenarios at least five times.

## Metrics

### Runtime

- Push-to-run-visible latency
- Queue duration
- Runner startup duration
- Checkout duration and bytes transferred
- Dependency restore/install duration
- Task-cache restore/save duration and bytes
- Workload duration
- Artifact upload duration
- Total wall duration
- Median, p90, and run-to-run variance

### Developer experience

- Minutes to first green run
- Configuration lines and provider-specific files
- Documentation lookups and setup failures
- Log navigation and search quality
- Local reproduction and remote debugging options
- Rerun granularity
- Secret and environment setup complexity

### Agent experience

- Can an agent complete setup without browser-only steps?
- Are run, job, log, artifact, retry, and cancel APIs structured and documented?
- Does the provider expose machine-readable failure summaries?
- How many commands, tool calls, and corrective iterations are needed?
- Can credentials be narrowly scoped and safely rotated?

## Result handling

Download provider-native timing data plus the JSON files produced in `results/`. Do not compare different commits or runner sizes in the same aggregate.

