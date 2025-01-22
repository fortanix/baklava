
[![npm](https://img.shields.io/npm/v/@fortanix/baklava.svg?style=flat)](https://www.npmjs.com/package/@fortanix/baklava)
[![CI](https://github.com/fortanix/baklava/actions/workflows/ci.yaml/badge.svg)](https://github.com/fortanix/baklava/actions)

# Fortanix Baklava Design System

This repository contains the Baklava design system used to build [Fortanix](https://fortanix.com) products.

You can find the latest Storybook documentation [here](https://fortanix.github.io/baklava).


## Usage

Requirements:

- React v19 or higher.

Installation:

```console
npm install --save @fortanix/baklava
```

Add the `BaklavaProvider` to the top level of your application, in order to enable certain features like toast
notifications:

```tsx
import { BaklavaProvider } from '@fortanix/baklava';

export const App = () => {
  <BaklavaProvider>
    <MyApp/>
  </BaklavaProvider>
};
```

To import a component:

```tsx
import { Button } from '@fortanix/baklava';
```

The package automatically includes CSS through Sass (`.scss`) imports. However, this assumes that you have set up your
project in such a way that `.scss` imports (as well as assets like images and fonts) are handled. If you're using vite,
this will be supported out of the box. Otherwise, you may need to configure your bundler accordingly.

Icons are loaded through SVG sprites. This requires some additional setup. If you're using vite, install the
`vite-plugin-svg-icons` plugin:

```console
npm install --save vite-plugin-svg-icons
```

Then, add the following to the `plugins` array in your vite config:

```ts
createSvgIconsPlugin({
  iconDirs: [path.resolve(__dirname, 'node_modules/@fortanix/baklava/src/assets/icons')],
  symbolId: 'baklava-icon-[name]',
  inject: 'body-last',
  customDomId: 'baklava-icon-sprite',
}),
```

Additionally, you will need to add the following import in your main entry file:

```ts
import 'virtual:svg-icons-register';
```

Please make sure that Baklava is the first CSS that gets loaded in to your bundle. Baklava relies on CSS
[cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers) for its specificity
management. If your application emits any code that uses an `@layer` name that is also used by Baklava
(like `baklava.components`), and Baklava's layer ordering is not emitted first, then the ordering of the layers will
get messed up (since browsers order layers by source order). If you want, you can also just emit the layers ordering
from Baklava explicitly (rather than the whole bundle):

```
@use '@fortanix/baklava/styling/layers.scss';
@include layers.styles;
```


## Contributing

We gratefully accept bug reports and contributions from the community.
By participating in this community, you agree to abide by [Code of Conduct](./CODE_OF_CONDUCT.md).
All contributions are covered under the Developer's Certificate of Origin (DCO).

### Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
have the right to submit it under the open source license
indicated in the file; or

(b) The contribution is based upon previous work that, to the best
of my knowledge, is covered under an appropriate open source
license and I have the right under that license to submit that
work with modifications, whether created in whole or in part
by me, under the same open source license (unless I am
permitted to submit under a different license), as indicated
in the file; or

(c) The contribution was provided directly to me by some other
person who certified (a), (b) or (c) and I have not modified
it.

(d) I understand and agree that this project and the contribution
are public and that a record of the contribution (including all
personal information I submit with it, including my sign-off) is
maintained indefinitely and may be redistributed consistent with
this project or the open source license(s) involved.

## License

This project is primarily distributed under the terms of the Mozilla Public License (MPL) 2.0, see [LICENSE](./LICENSE) for details.
