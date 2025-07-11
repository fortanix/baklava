/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../util/reactUtil.ts';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../components/overlays/ToastProvider/ToastProvider.tsx';
import { Button } from './Button.tsx';
import { loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';


type ButtonArgs = React.ComponentProps<typeof Button>;
type Story = StoryObj<typeof Button>;

export default {
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    // Some surrounding text to show block/inline behavior
    Story => (
      <div>
        {loremIpsumSentence} {loremIpsumSentence.slice(0, 50)} <Story/> {loremIpsumSentence}
      </div>
    ),
  ],
  args: {
    children: 'Button',
    onClick: () => { notify.info('You clicked the button'); },
  },
} satisfies Meta<ButtonArgs>;


export const ButtonStandard: Story = {};

export const ButtonLight: Story = {
  args: { light: true },
};

export const ButtonPrimary: Story = {
  args: { primary: true },
};

export const ButtonDisabled: Story = {
  args: { disabled: true, onClick: () => { notify.error('Should never be triggered'); } },
};

export const ButtonLightDisabled: Story = {
  args: { light: true, disabled: true, onClick: () => { notify.error('Should never be triggered'); } },
};

export const ButtonPrimaryDisabled: Story = {
  args: { primary: true, disabled: true, onClick: () => { notify.error('Should never be triggered'); } },
};

/** Set `large` to true to render the button with a large size */
export const ButtonLarge: Story = {
  args: { primary: true, large: true },
};

/** Set `block` to true to render the component as a full-width block. */
export const ButtonBlock: Story = {
  args: { primary: true, block: true },
};

/** Set `plain` to true to render the button with minimum styling. */
export const ButtonPlain: Story = {
  args: { plain: true },
};

/**
 * By default this component renders an HTML `<button>` element. To customize this, pass a compatible component type
 * as the `renderAs` prop.
 */
export const ButtonRenderAs: Story = {
  args: { renderAs: 'a', children: 'This is an <a/> element' },
};

const ButtonWithRefC = (props: React.ComponentProps<typeof Button>) => {
  const ref = React.useRef<React.ComponentRef<typeof Button>>(null);
  
  useEffectOnce(() => {
    ref.current?.click();
  });
  
  return <Button {...props} ref={ref}/>;
};
export const ButtonWithRef: Story = {
  render: args => <ButtonWithRefC {...args}/>,
  args: {
    primary: true,
    onClick: () => { notify.success('Triggered click using ref'); },
  },
};
