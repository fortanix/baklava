/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToggleButton } from './ToggleButton.tsx';


type ToggleButtonArgs = React.ComponentProps<typeof ToggleButton>;
type Story = StoryObj<ToggleButtonArgs>;

export default {
  component: ToggleButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Toggle me',
  },
  render: (args) => <ToggleButton {...args}/>,
} satisfies Meta<ToggleButtonArgs>;


export const ToggleButtonStandard: Story = {};

export const ToggleButtonToggled: Story = {
  args: { toggledDefault: true },
};

export const ToggleButtonHovered: Story = {
  args: { className: 'pseudo-hover' },
};

export const ToggleButtonFocused: Story = {
  args: { className: 'pseudo-focus-visible' },
};

export const ToggleButtonNonactive: Story = {
  args: { nonactive: true },
};
export const ToggleButtonNonactiveToggled: Story = {
  args: { nonactive: true, toggledDefault: true },
};

export const ToggleButtonDisabled: Story = {
  args: { disabled: true },
};
export const ToggleButtonDisabledToggled: Story = {
  args: { disabled: true, toggledDefault: true },
};

export const ToggleButtonWithIcon: Story = {
  args: { icon: 'account' },
};

export const ToggleButtonEmbedded: Story = {
  args: { embedded: true },
};

export const ToggleButtonWithOverflow: Story = {
  args: {
    style: { inlineSize: '30ch' },
    children: 'This text should overflow with ellipsis',
  },
};

/** A toggle button can also be used with `role="radio"` (or similar roles). */
export const ToggleButtonAsRadio: Story = {
  args: {
    role: 'radio',
    label: 'Check me',
  },
};

const ToggleButtonControlledC = (args: ToggleButtonArgs) => {
  const [toggled, setToggled] = React.useState(args.toggledDefault ?? false);
  return (
    <div>
      <style>{`@scope { display: grid; place-items: center; gap: 0.4lh; }`}</style>
      <div>Current state: {toggled ? 'toggled' : 'untoggled'}</div>
      <ToggleButton {...args} toggled={toggled} onToggledChange={setToggled}/>
    </div>
  );
};
export const ToggleButtonControlled: Story = {
  render: (args) => <ToggleButtonControlledC {...args}/>,
  args: {
    //toggledDefault: true, // TEMP
  },
};
