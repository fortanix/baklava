
# Contributing

## Code of Conduct

Please see `./CODE_OF_CONDUCT.md`.


## Change requests

Feature branch names should be of the form `feature/<issue-ref>-<issue-summary>`, where `<issue-ref>` is a reference
to the relevant issue number, if any, and `<issue-summary>` is a short summary of the issue in camel case. For example:
`feature/gh-2-add-new-gizmo`. If there is no issue number for the change (e.g. it's a quick one-off change), use the
format `<username>/<date>-<summary>`, for example `mkrause/241129-upgrade-dependencies`.


## Release workflow

To create a new release:

- Create a release branch named `release/vx.y.z`.

- Submit a release PR targeting the `master` branch:
  - Bump the version in `package.json.js`.
  - Run `npm run install-project` to update the `package.json` and `package-lock.json` files.
  - The commit message should be of the form "Release vx.y.z"
  - The title of the release PR should be of the form "Release vx.y.z"

- Once the PR is merged, create a new release:
  - Go the GitHub repo, and navigate to ["Releases"](https://github.com/fortanix/baklava/releases).
  - Click ["Draft a new release"](https://github.com/fortanix/baklava/releases/new).
  - Under "Choose a new tag", create a new tag of the form `vx.y.z`.
  - The name of the release should be of the form `vx.y.z`.
  - Write the release notes.
  - If the version is a pre-release, mark it as such.
  - Hit "Publish the release".

- Once the release has been created, a GitHub Actions workflow will automatically run to publish this release to npm.
