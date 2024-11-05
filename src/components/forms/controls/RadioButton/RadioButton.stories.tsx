/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { RadioButton } from './RadioButton.tsx';


type RadioButtonArgs = React.ComponentProps<typeof RadioButton>;
type Story = StoryObj<RadioButtonArgs>;

export default {
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {},
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <RadioButton {...args}/>,
} satisfies Meta<RadioButtonArgs>;


export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Unchecked: Story = {
  args: {},
};

export const DisabledSelected: Story = {
  name: 'Disabled (selected)',
  args: { disabled: true, defaultChecked: true },
};

export const DisabledUnselected: Story = {
  name: 'Disabled (unselected)',
  args: { disabled: true },
};
