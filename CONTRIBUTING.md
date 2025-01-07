
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

- First, create a release PR:
  - Create a release branch named `release/vx.y.z`.
  - Bump the version in `package.json.js`.
  - Run `npm run install-project` to update the `package.json` and `package-lock.json` files.
  - Commit the changes, and push the branch. The commit message should be "Release vx.y.z".
  - Create a new PR targeting the `master` branch. The title should be "Release vx.y.z".
    - Note: you can run `npm run automate github:create-release-pr` to generate a link with all the information
      prefilled.

- Once the release PR is merged, create a new GitHub release:
  - From the `master` branch, run `npm run automate github:create-release`, this will generate a link to create the
    release with all the information filled in.
  - Or if you want to do it manually:
    - Go the GitHub repo, and navigate to ["Releases"](https://github.com/fortanix/baklava/releases).
    - Click ["Draft a new release"](https://github.com/fortanix/baklava/releases/new).
    - Under "Choose a new tag", create a new tag of the form `vx.y.z`.
    - The name of the release should be of the form `vx.y.z`.
  - Write the release notes.
  - If the version is a pre-release, mark it as such.
  - Hit "Publish the release".

- Once the release has been created, a GitHub Actions workflow will automatically run to publish this release to npm.


**Script:**

```console
VERSION=x.y.z
git co -b release/v${VERSION}
sed -i '' "s/version: '.*'/version: '${VERSION}'/" package.json.js
npm run install-project
git add package.json.js package.json package-lock.json
git ci -m "Release v${VERSION}"
git push -u origin HEAD
npm run automate github:create-release-pr
# Follow instructions from above command
```
