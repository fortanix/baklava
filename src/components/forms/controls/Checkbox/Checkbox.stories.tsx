/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Checkbox } from './Checkbox.tsx';


type CheckboxArgs = React.ComponentProps<typeof Checkbox>;
type Story = StoryObj<CheckboxArgs>;

export default {
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    defaultChecked: true,
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Checkbox {...args}/>,
} satisfies Meta<CheckboxArgs>;


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
