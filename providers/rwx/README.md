# RWX

Add the current RWX native configuration after creating a test account and confirming its latest syntax.

The integration must:

- Pin Node 22.
- Restore dependency and `.bench-cache` data.
- Run `npm ci --no-audit --no-fund`.
- Run `npm run bench -- --provider rwx --workload all --scenario <scenario>`.
- Export `results/` as downloadable artifacts.
- Record which work is reused or skipped and why.
- Document CLI/API-only setup and inspection paths for agents.

