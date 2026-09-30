# Depot Evaluation Notes

## Run identity

- Provider: Depot
- Product/mode: Depot CI / Depot GitHub runner
- Evaluation date:
- Repository URL:
- Commit SHA:
- Runner label: `depot-ubuntu-24.04`
- CPU / memory / architecture: 2 CPU / 8 GB / x86_64
- Region, if known:
- Pricing plan:

## Setup experience

- Start time:
- First green time:
- Total minutes:
- Browser-only steps:
- CLI steps:
- Permissions requested:
- Credentials or identity model:
- Errors and retries:
- Documentation used:

## Scenario results

### Depot CI

| Scenario | Run ID | Queue | Setup | Workload | Total | Cache hits/misses | Cost | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Cold | | | | | | | | |
| Warm | | | | | | | | |
| Source change | | | | | | | | |
| Lockfile change | | | | | | | | |
| Docs only | | | | | | | | |
| Failed task | | | | | | | | |
| Burst | | | | | | | | |

### Depot GitHub runner

| Scenario | GitHub run ID | Queue | Setup | Workload | Total | Cache hits/misses | Cost | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Cold | | | | | | | | |
| Warm | | | | | | | | |
| Source change | | | | | | | | |
| Lockfile change | | | | | | | | |
| Docs only | | | | | | | | |
| Failed task | | | | | | | | |
| Burst | | | | | | | | |

## Depot-specific checks

### Depot CI

- `depot ci run` with local changes:
- `--follow` log streaming:
- `--ssh` / `--ssh-after-step` debugging:
- Single-job execution:
- Structured CLI output:
- Retry and cancellation:
- Artifact retrieval:
- CPU/memory metrics:
- API completeness:
- GitHub checks/status reporting:

### Depot GitHub runner

- Existing Actions workflow compatibility:
- Runner startup time:
- GitHub rerun/cancel behavior:
- Depot cache visibility:
- Depot runner analytics:
- Depot runner API:
- GitHub App installation friction:

## Developer experience

- Configuration clarity:
- Log quality:
- Cache visibility:
- Rerun granularity:
- Debugging options:
- Artifact/test reporting:
- Biggest delight:
- Biggest frustration:

## Agent experience

- Setup possible without browser:
- Structured start/status/log/cancel/retry APIs:
- Authentication/scoping:
- Agent tool calls required:
- Agent failure modes:

## Conclusions

- Best use cases:
- Poor fit:
- Features Cloudflare managed CI should copy:
- Features Cloudflare managed CI should improve:
- Open questions:
