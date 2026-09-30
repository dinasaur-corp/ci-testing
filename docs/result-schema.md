# Result schema

Each `results/*.json` file contains:

- `schemaVersion`: result format version.
- `provider`, `workload`, `scenario`: experiment dimensions.
- `startedAt`, `finishedAt`, `durationMs`: benchmark-run timing.
- `cache.hits`, `cache.misses`: content-addressed workload cache behavior.
- `metadata`: commit, branch, provider run/job IDs, runner label, CPU count, Node version, and platform.
- `tasks`: per-unit build/test duration, pass/fail status, cache status, and cache key prefix.

Provider queue, checkout, dependency cache, and artifact timings should be collected separately from provider APIs because they occur outside the benchmark process.
