# Namespace

Use Namespace as a GitHub Actions runner replacement so workload and workflow logic remain unchanged.

1. Connect the benchmark repository to a test Namespace project.
2. Copy `.github/workflows/benchmark.yml` to a Namespace-specific workflow.
3. Change only `runs-on` and required authentication/setup.
4. Set `BENCH_PROVIDER=namespace` and record the exact runner class.
5. Run the standard cold, warm, source-change, and burst scenarios.

Do not commit credentials. Confirm current runner labels and authentication steps in Namespace's documentation during setup.

