/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import { type SwitchProps, Switch } from './Switch.tsx';


type Story = StoryObj<SwitchProps>;
export default {
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    'aria-label': 'Test switch',
    defaultChecked: true,
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Switch {...args}/>,
} satisfies Meta<SwitchProps>;


export const Checked: Story = {};

export const Unchecked: Story = {
  args: { defaultChecked: false },
};

export const DisabledChecked: Story = {
  name: 'Disabled (checked)',
  args: { disabled: true, defaultChecked: true },
};

export const DisabledUnchecked: Story = {
  name: 'Disabled (unchecked)',
  args: { disabled: true, defaultChecked: false },
};

export const SwitchLabeled: Story = {
  render: (args) => <Switch.Labeled label="Label" {...args}/>,
  args: {
    defaultChecked: true,
  },
};
