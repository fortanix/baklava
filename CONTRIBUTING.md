
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

**Script:**

```shell
# Define the new version
# Note: this should be the version number without any prefix, for example: "VERSION=1.0.0"
VERSION=x.y.z

# Bump the version and create a PR
if [ -z "$VERSION" ] || [ "$VERSION" = "x.y.z" ]; then echo "\n\nDid you forget to change the VERSION?"; else
git checkout -b release/v${VERSION}
sed -i.bak "s/version: '.*'/version: '${VERSION}'/" package.json.js
rm package.json.js.bak
npm run install-project
git add package.json.js package.json package-lock.json
git commit -m "Release v${VERSION}"
git push -u origin HEAD
npm run automate github:create-release-pr
fi
# Follow instructions from above command
```

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

**Script:**

```shell
git checkout master
git pull
npm run automate github:create-release
# Follow instructions from above command
```

- Once the release has been created, a GitHub Actions workflow will automatically run to publish this release to npm.

## Publishing to npm

To publish to npm:

```shell
npm publish --scope=@fortanix --access=public --dry-run # --tag=beta
```

Set the --tag as appropriate: beta for beta releases, or remove the --tag if you want to publish a stable release. Remove the --dry-run once you’ve confirmed there are no issues.

**Note: you rarely need to do this manually. Instead, see the "Release workflow" above, which will trigger an npm publish automatically upon creation of a GitHub release.**


## FAQ

**Q: I'm getting the following error in GitHub Actions CI after changing the `package.json`, what should I do?**

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
```

- A: This happens when your local machine uses a different OS (e.g. Mac). One workaround you can find online is to add said dependency to `optionalDependencies`. This fixes that particular problem, but you will just continue to get the same errors for other dependencies. Instead, do as the error message suggests and completely remove `node_modules` and `package-lock.json` and re-install. This should fix the errors.



## Legacy

[This repo](https://github.com/mkrause/baklava) contains a fork of [Baklava](https://github.com/fortanix/baklava) that
includes additional "legacy" components under `src/legacy`. These legacy components are exported through a separate
path `@fortanix/baklava/legacy` (see the exports under `package.json`).

*NOTE:* use the branch `baklava-v1-legacy` on the fork. Keep the `master` branch in sync with upstream `master`.

This repo is not published to npm. If you need to import this library, use the build packages generated as part of the
[GitHub releases](https://github.com/mkrause/baklava/releases):

```js
// package.json
'@fortanix/baklava': 'https://github.com/mkrause/baklava/releases/download/v1.0.0-legacy-<version>/package.tar.gz',
```


### Syncing with upstream

You can use the GitHub UI to sync with upstream. If you need a local version of the legacy `master` branch, you can
also follow the following:

- In your local repo, make sure you have one remote set up for upstream (`origin`) and one for the fork (`legacy`).

```shell
git remote add legacy git@github.com:mkrause/baklava.git
```

- Check out the `master` branch from `legacy` as a new local `legacy-master` branch:

```shell
git checkout -b legacy-master legacy/master
```

- Make sure your local `master` branch is up to date, then use `git rebase -i` to rebase `legacy-master`.

```shell
git checkout legacy-master
git rebase -i master
```


## Publishing a new release

- Create a [new GitHub release](https://github.com/mkrause/baklava/releases), with the following parameters:
  - Target branch: `baklava-v1-legacy`
  - Tag: create new tag, name format: `v1.0.0-legacy-<date>`
  - Pre-release branch: yes

Or, use the following URL, replacing `[tag]` with the appropriate tag (format: `v1.0.0-legacy-<date>`):

https://github.com/mkrause/baklava/releases/new?target=baklava-v1-legacy&prerelease=1&tag=v[tag]&title=Release%20v[tag]
