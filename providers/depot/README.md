# Depot Evaluation

Last reviewed: September 30, 2026.

Measured findings and the next benchmark plan are in `providers/depot/REPORT.md`. Capability and project-type support are tracked in `providers/depot/FEATURE_MATRIX.md`.

Depot has two relevant products. Test them separately:

1. **Depot CI**: Depot orchestrates workflows in `.depot/workflows/`. This is the primary experiment because it evaluates CI developer and agent experience.
2. **Depot GitHub Actions runners**: GitHub still orchestrates the workflow; only `runs-on` changes. This isolates runner startup, compute, and cache performance.

Record results in `providers/depot/NOTES.md`.

## Track A: Depot CI — start here

### 1. Publish this repository to GitHub

Create an empty repository in a test GitHub organization, then run:

```bash
git add .
git commit -m "Initial CI benchmark kit"
git remote add origin git@github.com:YOUR_ORG/ci-bench.git
git push -u origin main
```

Keep the repository synthetic and do not add production secrets.

### 2. Install and authenticate the Depot CLI

```bash
brew install depot/tap/depot
depot login
```

Record whether login requires a browser and how long it takes.

### 3. Connect Depot to the GitHub repository

In Depot organization settings, connect **GitHub Code Access** and grant access to the test repository. This is the manual setup step that an agent generally cannot complete alone.

### 4. Run the prepared workflow from the local checkout

The ready-to-run workflow is `.depot/workflows/benchmark.yml`.

```bash
depot ci run \
  --workflow .depot/workflows/benchmark.yml \
  --job benchmark \
  --follow
```

Depot can include local tracked changes in a run. New untracked files must be staged first, which is another reason to create the initial commit before starting.

### 5. Run a controlled cold/warm pair

From the dashboard or CLI, run the workflow twice against the same commit. Label the first run `cold` and second run `warm` when using dispatch:

```bash
depot ci dispatch \
  --repo YOUR_ORG/ci-bench \
  --workflow benchmark.yml \
  --ref main \
  --input workload=all \
  --input scenario=cold \
  --output json

depot ci dispatch \
  --repo YOUR_ORG/ci-bench \
  --workflow benchmark.yml \
  --ref main \
  --input workload=all \
  --input scenario=warm \
  --output json
```

Use `depot ci run list` and `depot ci status <run-id>` to inspect runs. Save the JSON output and download the benchmark artifact.

### 6. Complete the shared protocol

Follow `docs/provider-evaluation-runbook.md`, including source-change, lockfile, docs-only, intentional failure, burst, rerun, cancellation, and agent API/CLI exercises.

### 7. Evaluate Depot-specific DX/AX

Test and record:

- Running uncommitted local changes with `depot ci run`.
- Running only `--job benchmark`.
- Live logs with `--follow`.
- Debug access with `--ssh` or `--ssh-after-step`.
- Structured output from dispatch/status commands.
- Retry, cancellation, artifact retrieval, metrics, and API coverage.
- Compatibility differences from the GitHub Actions workflow.

## Track B: Depot-managed GitHub Actions runner

Depot's runner integration requires a GitHub organization repository and installation of the Depot GitHub App.

### 1. Connect the runner integration

In the Depot dashboard, open **GitHub Actions**, connect the GitHub organization, and install/authorize the Depot GitHub App for the test repository. Confirm the connection is approved if the GitHub organization requires app approval.

### 2. Run the prepared workflow

The ready-to-run workflow is `.github/workflows/benchmark-depot-runner.yml`. It uses `depot-ubuntu-24.04-4` to match the four CPUs observed on the GitHub-hosted baseline and only runs through manual dispatch, avoiding duplicate automatic runs.

In GitHub, open **Actions → Depot GitHub runner benchmark → Run workflow**. Run `cold`, then rerun the same commit as `warm`.

The equivalent GitHub-hosted baseline is `.github/workflows/benchmark.yml`. Manually run both workflows with the same workload, scenario, commit, and approximately comparable machine size.

### 3. Complete the shared protocol

Run the same source-change, lockfile, docs-only, intentional failure, and burst scenarios from `docs/provider-evaluation-runbook.md`.

Record GitHub queue and job timing plus Depot's runner analytics. Do not combine Depot CI numbers with Depot runner numbers.

### 4. Evaluate runner-specific DX/AX

Test and record:

- Whether existing GitHub Actions configuration works unchanged apart from `runs-on`.
- Runner acquisition and startup time.
- `actions/cache` restore/save behavior and Depot cache visibility.
- GitHub CLI/API behavior for starting, inspecting, rerunning, and cancelling jobs.
- Depot analytics/API visibility that is additional to GitHub's data.
- GitHub App installation and organization-owner friction.

## Recommended order

1. Run GitHub-hosted baseline once.
2. Run Depot GitHub runner cold/warm tests.
3. Run Depot CI cold/warm tests.
4. Complete the full scenario matrix in each product.
5. Compare runner performance separately from orchestration, debugging, and agent experience.

## Optional migration-experience experiment

The repository already contains a Depot workflow, so it skips migration friction. To evaluate migration itself on a temporary branch:

```bash
git switch -c bench/depot/migration
mv .depot /tmp/ci-bench-depot-workflows
depot ci migrate
git diff -- .depot
```

Record prompts, compatibility edits, warnings, and time required. Restore the prepared version afterward rather than merging the generated experiment unless it is better.

## Security notes

- Do not commit Depot or GitHub tokens.
- Prefer short-lived/OIDC credentials for real build integrations.
- Use a test GitHub organization and repository.
- Set a spending limit before burst or large-runner experiments.
