# Providers

| Provider | Native entrypoint | Initial use |
| --- | --- | --- |
| GitHub Actions | `.github/workflows/benchmark.yml` | Baseline hosted CI |
| CircleCI | `.circleci/config.yml` | Customer-mentioned hosted CI |
| GitLab CI | `.gitlab-ci.yml` | Stratus/internal baseline |
| Depot CI | `.depot/workflows/benchmark.yml` | Full CI DX/AX evaluation |
| Depot GitHub runner | GitHub workflow runner override | Isolated compute/cache evaluation |
| Namespace | GitHub workflow runner override | Faster runner and cache experiments |
| RWX | Add after account setup | Compute-aware CI and agent DX study |
| Cloudflare managed CI | Future implementation | Product contract and comparison target |

Every provider should run `npm ci` followed by the same `npm run bench` command and upload `results/`.
