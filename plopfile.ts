/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dedent } from 'ts-dedent';
import * as path from 'node:path';

import { type HelperOptions } from 'handlebars';
import { type NodePlopAPI } from 'plop';


const componentTemplate = {
  /*
    Explanation:
      - `import { ... } from '../util/componentUtil.ts'`
        > `componentUtil.ts` has a few utilities to work with component definitions:
          - Custom version of `classNames` that uses `classnames/dedupe` so that consumers can override/remove classes:
            `<MyComponent className={{ 'predefined-class': false }}/> // Removes .predefined-class`
            - To make this work, components should put the `className` at the *end* of `cx(..., className)`.
          - `ComponentProps` type: automatically overrides the `className` prop to support `classnames` syntax.
      - `import cl from './MyComponent.module.scss'`
        > Imports the local class names from the given CSS/Sass module.
        > To make this work with TypeScript, we need:
          - `src/types/globals.d.ts` to make TypeScript aware of `.module.{s}css` files.
          - `typescript-plugin-css-modules` compiler extension for more precise types + autocomplete support.
      - `React.PropsWithChildren<...>`
        > Add this if you want the component to support a standard `children: ReactNode` prop. If the component does
          not allow children, or if you want to customize the type of `children`, remove this type wrapper.
      - `/** ...`
        > Add doc blocks to the component as well as individual properties, these will be shown in the Storybook docs.
      - `variant?: undefined | 'x' | 'y',`
        > For any optional (i.e. `?:`) prop, also specify `undefined` as a value explicitly. Since we have
         `exactOptionalPropertyTypes` enabled in TS, this is necessary to allow `prop={undefined}` to work.
        > This also requires `shouldRemoveUndefinedFromOptional` enabled in Storybook, for better controls UI.
      - `ComponentProps<'div'> & ...`
        > Add `ComponentProps<>` to the props if you want the consumer to be able to pass additional properties through
          to the underlying element. Can be a tag (e.g. `'div'`) or another component (e.g. `typeof OtherComponent`).
      - ```
        {...propsRest}
        className={cx('bk', 'my-classname', className)
        ```
        > If you added `ComponentProps<>`, then `propsRest` capture these additional props. Most props should be
          defined *before* `{...propsRest}` so that the consumer can override props. If you don’t want a prop to be
          able to be overridden, specify it after `{...propsRest}`. If you need to combine a prop from `propsRest` with
          your own definition (e.g. as in `className` above), also add it after `{...propsRest}`.
        > Add the global `bk` class name to any component to mark it as a Baklava component. This is useful for style
          isolation, so that anything inside a `.bk` is excluded from other style rules. In the future once `@scope` is
          supported in browsers it can be useful to do `@scope (.my-class) to (.bk) {}`.
  */
  'Component.tsx': dedent`
    /* Copyright (c) Fortanix, Inc.
    |* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
    |* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
    
    import * as React from 'react';
    import { classNames as cx, type ComponentProps } from '{{{relative-path "src/util/componentUtil.ts"}}}';
    
    import cl from './{{{component-name}}}.module.scss';
    
    
    export { cl as {{{component-name}}}ClassNames };
    
    export type {{{component-name}}}Props = ComponentProps<{{{format-element-type-ts element-type}}}> & {
      /** Whether this component should be unstyled. */
      unstyled?: undefined | boolean,
      
      /** Some property specific to \`{{{component-name}}}\`. */
      variant?: undefined | 'x' | 'y',
    };
    {{"\\n"~}}
    {{~#if component-description}}
    /**
     * {{{component-description}}}
     */
    {{/if}}
    export const {{{component-name}}} = (props: {{{component-name}}}Props) => {
      const { unstyled = false, variant, ...propsRest } = props;
      return (
        <{{{element-type}}}
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-{{{kebabCase component-name}}}']]: !unstyled },
            { [cl['bk-{{{kebabCase component-name}}}--x']]: variant === 'x' },
            { [cl['bk-{{{kebabCase component-name}}}--y']]: variant === 'y' },
            propsRest.className,
          )}
        />
      );
    };
  ` + '\n',
  
  /*
    Explanation:
      - This is a CCS Modules file, plus Sass as a preprocessor.
        > CSS Modules allows the following syntax: `:local()`, `:global()` for local and global classes respectively.
        > Note: other CSS Modules syntax like `@value` or `composes` is not well-supported by Vite/lightningcss.
      - `@use '../styling/defs.scss' as bk`
        > Common definitions like mixins are loaded from `defs.scss` through Sass `@use`. Use `bk` as a namespace.
      - `@layer baklava.components`
        > All Baklava components should be in the `baklava.components` cascade layer, so that application CSS rules can
          take precedence.
      - `bk.$color-neutral-700`
        > Design tokens that are static (e.g. not theme-dependent) can be defined using Sass variables. Dynamic
          variables should use CSS custom properties (`--foo`).
      - `--bk-my-component-background-color: light-dark(color1, color2)`
        > This is an example of a semantic design token. They should be defined local to the component code.
        > The CSS `light-dark()` function should be used to give both the light and dark theme colors in one place.
      - `@media (prefers-reduced-motion: no-preference) { ...`
        > For accessibility, most animations and transitions should only be enabled if the user agent is configured
          with `prefers-reduced-motion: no-preference`. There are exceptions, e.g. if the animation has a functional
          purpose (like for a loading spinner).
  */
  'Component.module.scss': dedent`
    /* Copyright (c) Fortanix, Inc.
    |* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
    |* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
    
    @use '{{{relative-path "src/styling/defs.scss"}}}' as bk;
    
    @layer baklava.components {
      .bk-{{{kebabCase component-name}}} {
        @include bk.component-base(bk-{{{kebabCase component-name}}});
        
        --bk-{{{kebabCase component-name}}}-background-color: light-dark(#{bk.$color-neutral-700}, #{bk.$color-neutral-50});
        --bk-{{{kebabCase component-name}}}-text-color: light-dark(#{bk.$color-neutral-50}, #{bk.$color-neutral-700});
        
        overflow: hidden;
        cursor: default;
        
        max-width: 30rem;
        max-height: 8lh;
        
        margin: bk.$spacing-3;
        padding: bk.$spacing-3;
        border-radius: bk.$spacing-3;
        background: var(--bk-{{{kebabCase component-name}}}-background-color);
        
        @include bk.text-layout;
        color: var(--bk-{{{kebabCase component-name}}}-text-color);
        @include bk.font(bk.$font-family-body);
        font-size: bk.$font-size-m;
        
        @media (prefers-reduced-motion: no-preference) {
          --transition-duration: 150ms;
          transition:
            opacity var(--transition-duration) ease-out;
        }
      }
    }
  ` + '\n',
  
  /*
    Explanation:
      - `export const Standard: Story = ...`
        > The first exported story in the module will be used as the "standard" story at the top of the generated docs
          page. This story should give the most typical example of the component.
  */
  'Component.stories.tsx': dedent`
    /* Copyright (c) Fortanix, Inc.
    |* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
    |* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
    
    import * as React from 'react';
    
    import type { Meta, StoryObj } from '@storybook/react-vite';
    
    import { {{{component-name}}} } from './{{{component-name}}}.tsx';
    
    
    type {{{component-name}}}Args = React.ComponentProps<typeof {{{component-name}}}>;
    type Story = StoryObj<{{{component-name}}}Args>;
    
    export default {
      component: {{{component-name}}},
      tags: ['autodocs'],
      parameters: {
        layout: '{{storybook-layout}}',
      },
      argTypes: {},
      args: {
        children: 'Example',
      },
      render: (args) => <{{{component-name}}} {...args}/>,
    } satisfies Meta<{{{component-name}}}Args>;
    
    
    export const {{{component-name}}}Standard: Story = {};
    
    export const {{{component-name}}}WithVariant: Story = {
      args: {
        variant: 'x',
      },
    };
  ` + '\n',
};

export default (plop: NodePlopAPI) => {
  // Compute the relative path from the component file to the given target path.
  plop.setHelper('relative-path', (pathTargetFromCwd, options: HelperOptions) => {
    if (typeof pathTargetFromCwd !== 'string') { throw new Error(`Missing argument to 'relative-path' helper`); }
    
    const pathComponentFromCwd: undefined | string = options.data?.root?.['component-path'];
    if (typeof pathComponentFromCwd !== 'string') { throw new Error(`Missing 'component-path' variable`); }
    
    const pathComponentAbs = path.join(process.cwd(), pathComponentFromCwd);
    const pathTargetAbs = path.join(process.cwd(), pathTargetFromCwd);
    const pathTargetRel = path.relative(pathComponentAbs, pathTargetAbs);
    
    return pathTargetRel;
  });
  
  // Format the given component type as a TypeScript expression
  plop.setHelper('format-element-type-ts', (componentType, options: HelperOptions) => {
    if (typeof componentType !== 'string') { throw new Error(`Missing argument to 'format-element-type' helper`); }
    
    if (/^[A-Z]/.test(componentType)) {
      return `typeof ${componentType}`;
    } else {
      return `'${componentType}'`;
    }
  });
  
  plop.setGenerator('component', {
    description: 'Generating a Baklava component',
    prompts: [
      {
        type: 'input',
        name: 'component-path',
        message: 'What is the path to the parent directory of the component? (E.g. `src/components/MyComponent`)',
        default: 'src/components',
      },
      {
        type: 'input',
        name: 'component-name',
        message: 'What is the name of the component (in CamelCase)? (E.g. `MyComponent`)',
        default: (answers) => {
          const directoryName = path.basename(answers['component-path']);
          return directoryName ?? 'MyComponent';
        },
      },
      {
        type: 'input',
        name: 'element-type',
        message: 'What is the element type of the component? (E.g. "div", "OtherComponent")',
        default: 'div',
      },
      {
        type: 'input',
        name: 'component-description',
        message: 'Give a description for the component in sentence case (e.g. "A simple button component".)',
      },
      {
        type: 'input',
        name: 'storybook-layout',
        message: 'Which Storybook layout to use? (E.g. fullscreen, padded, centered)',
        default: 'centered',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{component-path}}/{{{component-name}}}.tsx',
        template: componentTemplate['Component.tsx'],
      },
      {
        type: 'add',
        path: '{{component-path}}/{{{component-name}}}.module.scss',
        template: componentTemplate['Component.module.scss'],
      },
      {
        type: 'add',
        path: '{{component-path}}/{{{component-name}}}.stories.tsx',
        template: componentTemplate['Component.stories.tsx'],
      },
    ],
  });
};
