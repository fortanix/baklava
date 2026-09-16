# Copilot instructions for Baklava

## Repository overview

Baklava is Fortanix's React 19 design-system/component library. The published package is built from the source in
`src/` and exposes its public API through `app/baklava.ts`. The repository also contains a small Vite demo in
`app/` and a Storybook used as the component documentation and browser-test surface.

The main source areas are:

- `src/components/`: reusable actions, containers, forms, graphics, lists, navigation, overlays, tables, text, and
  component utilities.
- `src/layouts/`, `src/typography/`, `src/fortanix/`: higher-level layouts, typography primitives, and
  Fortanix-specific components.
- `src/styling/`: Sass entrypoints, cascade-layer ordering, design tokens, themes, global styles, and public Sass
  mixins.
- `src/context/BaklavaProvider.tsx`: application-level providers for overlays/toasts and browser capability tracking.
- `.storybook/`: Storybook configuration, global preview setup, and Storybook/Vitest integration.
- `scripts/`: source/build verification, Figma token/icon importers, and release URL automation.

Vite builds the library as an ES module from `app/baklava.ts`, generates declarations into `dist/`, processes Sass
with Lightning CSS, and externalizes React and `react/jsx-runtime`. The package exports the compiled JavaScript and
types plus the public Sass entrypoints `@fortanix/baklava/styling/defs.scss` and
`@fortanix/baklava/styling/layers.scss`.

## Build, test, and lint

Use Node `>=26.4.0` and npm `>=11.17.0` as declared in `package.json`. Install dependencies with:

```sh
npm ci
```

`npm ci` runs the `prepare` hook, so it also performs the production build. The primary commands are:

```sh
npm run build          # Type-check, build dist, then run build verification
npm test               # Type-check, unit tests, SCSS lint, and source/license verification
npm run check:types    # TypeScript project-reference check
npm run lint           # Stylelint plus Biome lint
npm run lint:style     # Stylelint for src/**/*.scss
npm run lint:script    # Biome lint for configured app/src/tests files
npm run coverage       # Unit tests with V8 coverage
npm run storybook:serve
npm run storybook:build
npm run test:storybook # Browser Storybook tests with Vitest and Playwright
```

Run one unit test file without running the whole suite:

```sh
npx vitest run --project=unit src/components/actions/Button/Button.test.tsx
```

Filter to one test name with `-t`, for example:

```sh
npx vitest run --project=unit src/components/actions/Button/Button.test.tsx -t "default props"
```

The consumer-installation smoke test lives in `tests/installation/` and is also run by CI:

```sh
cd tests/installation
npm ci
npm test
```

## Making component changes

Components normally live in a directory containing a colocated `Component.tsx`, `Component.module.scss`,
`Component.stories.tsx`, and, where behavior needs unit coverage, `Component.test.tsx`. Use `npm run plop` to
generate the standard component or Storybook skeleton.

Follow the established component patterns:

- Add the Fortanix MPL copyright header to new source files. `npm test` enforces headers in source files; generated
  token files and the icon manifest are excluded.
- Use explicit `.ts`/`.tsx` extensions in imports. TypeScript is strict with `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, and `noUncheckedSideEffectImports`; optional props generally use
  `prop?: undefined | T`.
- Use `ComponentProps` and `classNames` from `src/util/componentUtil.ts` when wrapping native elements. This keeps
  `className` compatible with the repository's `classnames/dedupe` convention, allowing consumers to remove or
  override classes.
- Preserve the public `bk` marker class and the component's BEM-style `bk-...` classes. Put component styles in a
  CSS module and the `@layer baklava.components` cascade layer; use `src/styling/defs.scss` for shared Sass
  variables/mixins.
- Keep consumer-overridable props and HTML attributes flowing through to the underlying element, while placing
  component-enforced attributes after `{...propsRest}`. Follow existing `unstyled`, state, and `nonactive` patterns
  where applicable.
- Use CSS custom properties for semantic/theme-dependent values, Sass variables for static design tokens, and
  `light-dark()`/theme tokens for light and dark behavior. Gate nonessential transitions/animations behind
  `prefers-reduced-motion: no-preference`.
- Import the complete styling entrypoint before other CSS when wiring an app or preview. Cascade-layer ordering is
  source-order sensitive; `src/styling/main.scss` emits the layer ordering first.
- Use Storybook stories as the interactive documentation contract. Stories use `@storybook/react-vite`,
  `tags: ['autodocs']`, typed `Meta`/`StoryObj`, and explicit state/interaction variants. Storybook is decorated with
  `BaklavaProvider`; browser tests run stories through the Storybook Vitest plugin.
- Write unit tests with Vitest and Testing Library beside the implementation. Prefer role/name and behavior assertions;
  CSS module class assertions are used when the class/state mapping is itself part of the contract.

## Styling and generated sources

Do not edit generated outputs directly:

- `package.json` is generated from `package.json.js`; change the latter, then run `npm run gen-package` or
  `npm run install-project` when lockfile regeneration is needed.
- `src/styling/generated/colors_primitive.{scss,ts}` and `colors_semantic.{scss,ts}` are produced by the token import
  commands in `scripts/import.ts`.
- `src/assets/icons/_icons.ts` is generated from the SVG icon directory by `npm run import -- import-icons <path>`.

The icon pipeline expects 18x18 SVGs using `currentColor` and no hardcoded colors. The package's SVG sprite setup is
configured in Vite/Storybook; preserve the `virtual:svg-icons/register` setup when changing those entrypoints.

## Release and CI-specific details

CI uses Node `26.4.x`, runs `npm ci`, `npm test`, and the installation smoke test. The Storybook test workflow is
currently disabled in its job definition, and the Chromatic workflow is also disabled; do not treat those workflows as
required checks unless their `if: false` guards are removed.

For releases, edit the version in `package.json.js`, run `npm run install-project`, and follow `CONTRIBUTING.md`'s
`release/vx.y.z` branch and GitHub release process. Publishing is normally triggered by a published GitHub release,
not by a local `npm publish`.

Use `npm run verify verify:source` and `npm run verify verify:build` for the repository's explicit verification
commands. `npm run automate github:create-release-pr` and `npm run automate github:create-release` generate
pre-filled GitHub URLs for the release workflow.
