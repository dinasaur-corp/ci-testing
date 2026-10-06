# Namespace

Use Namespace as a GitHub Actions runner replacement so workload and workflow logic remain unchanged.

The prepared workflow is `.github/workflows/benchmark-namespace-runner.yml`. It is identical to the Depot runner workflow except for its name, artifact name, provider value, and `runs-on: namespace-profile-deenster`.

## Setup

1. In the Namespace dashboard, open **GitHub Actions** and connect the `dinasaur404` GitHub account or organization.
2. Install the Namespace GitHub App with access to `dinasaur404/ci-testing`.
3. Create a Linux amd64 runner profile. The current profile is `deenster` (`namespace-profile-deenster`): 4 vCPU / 8 GB, cache volumes on, remote builders on.
4. Push the workflow and run **Actions → Namespace runner benchmark → Run workflow** with scenario `cold`.
5. Rerun the same commit with scenario `warm`.
6. Record setup friction and timing in `providers/namespace/NOTES.md`.

Keep the first runs on GitHub's default cache path so they match Depot and GitHub-hosted runs. Evaluate Namespace cache volumes as a separate variant and record the profile change.

Do not commit credentials.
