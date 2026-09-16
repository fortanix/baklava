# Checkpoint: TypeScript 7 Upgrade

**Date:** 2026-09-16

## Changes

- Upgraded the TypeScript compiler to `7.0.2` through the official `@typescript/native` npm alias.
- Added `@typescript/typescript6@^6.0.2` and aliased `typescript` to that compatibility package so API-dependent tools such as `typescript-eslint` continue to work during the TypeScript 7 transition.
- Updated `vite-plugin-dts` from `4.5.4` to `5.1.0`.
- Updated the declaration plugin configuration from `outDir` to `outDirs`.
- Added the direct `@storybook/react@10.3.6` development dependency required by Storybook story imports and TypeScript module resolution.
- Regenerated `package.json`, `package-lock.json`, and `tests/installation/package-lock.json`.

## Validation

- Root `npm test` passed:
  - TypeScript project-reference check
  - 6 unit-test files
  - 118 unit tests
  - Stylelint
  - Source/license verification
- `tests/installation/npm test` passed:
  - TypeScript build using TypeScript 7's `tsc`
  - ESLint using the TypeScript 6 compatibility API
- `git diff --check` passed.
- Existing npm audit warnings remain and were not addressed.

## Current worktree

Modified:

- `package.json.js`
- `package.json`
- `package-lock.json`
- `tests/installation/package.json`
- `tests/installation/package-lock.json`
- `vite.config.ts`

No commit was created.
