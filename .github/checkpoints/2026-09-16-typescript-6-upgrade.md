# Checkpoint: TypeScript 6 Upgrade

**Date:** 2026-09-16

## Conversation summary

- Repository-specific Copilot guidance was created at `.github/copilot-instructions.md`.
- TypeScript was upgraded to the latest available v6 release, `6.0.3`.
- The canonical dependency source, generated package manifest, root lockfile, installation-test manifest, and installation-test lockfile were updated.
- `typescript-eslint` in `tests/installation` was upgraded to `^8.70.0` for TypeScript 6 peer compatibility.
- TypeScript 6 compatibility fixes:
  - Removed redundant deprecated `esModuleInterop: false` from `tsconfig.app.json` and `tsconfig.node.json`.
  - Added the `virtual:svg-icons/register` ambient declaration in `tests/installation/src/vite-env.d.ts`.
  - Updated `src/components/util/overlays/popover/usePopover.ts` to omit `togglePopover`'s `source` property when undefined, preserving behavior under `exactOptionalPropertyTypes`.

## Validation

- `npm test` passed: project-reference type check, 6 unit-test files, 118 unit tests, Stylelint, and source/license-header checks.
- `tests/installation/npm test` passed: TypeScript build and ESLint.
- Existing npm audit warnings were noted but not changed.

## Current worktree

Modified:

- `package.json.js`
- `package.json`
- `package-lock.json`
- `tests/installation/package.json`
- `tests/installation/package-lock.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `src/components/util/overlays/popover/usePopover.ts`
- `tests/installation/src/vite-env.d.ts`

Untracked:

- `.github/copilot-instructions.md`
- `.github/checkpoints/2026-09-16-typescript-6-upgrade.md`

No files were deleted. No commit was created.
