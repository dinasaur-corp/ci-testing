# Cloudflare managed CI target

Use this folder to turn benchmark observations into a product contract.

The first implementation should support:

- GitHub and GitLab repository connections.
- Push, pull/merge request, schedule, API, and manual triggers.
- Path and branch filters.
- Explicit CPU/memory selection and pinned execution images.
- Dependency caches with exact and fallback keys.
- Content-addressed task caches and safe concurrent writers.
- Artifacts, structured logs, test reports, and preview URLs.
- Cancellation, retries, failed-task reruns, fan-out, and child workflows.
- OIDC workload identity and protected-environment secrets.
- A complete API/CLI path for coding agents.

The provider adapter should run the same command:

```bash
npm ci --no-audit --no-fund
npm run bench -- --provider cloudflare-managed --workload all --scenario "$SCENARIO"
```

