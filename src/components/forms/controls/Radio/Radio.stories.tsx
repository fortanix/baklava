/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Radio } from './Radio.tsx';


type RadioArgs = React.ComponentProps<typeof Radio>;
type Story = StoryObj<RadioArgs>;

export default {
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Test radio',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Radio {...args}/>,
} satisfies Meta<RadioArgs>;


export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Unchecked: Story = {
  args: {},
};

export const DisabledSelected: Story = {
  name: 'Disabled (selected)',
  args: {
    defaultChecked: true,
    disabled: true,
  },
};

export const DisabledUnselected: Story = {
  name: 'Disabled (unselected)',
  args: { disabled: true },
};

export const FocusedSelected: Story = {
  name: 'Focused (selected)',
  args: {
    className: 'pseudo-focused',
    defaultChecked: true,
  },
};

export const FocusedUnselected: Story = {
  name: 'Focused (unselected)',
  args: {
    className: 'pseudo-focused',
  },
};

export const FocusedDisabledSelected: Story = {
  name: 'Focused & Disabled (selected)',
  args: {
    className: 'pseudo-focused',
    defaultChecked: true,
    disabled: true,
  },
};

export const RadioLabeled: Story = {
  render: (args) => <Radio.Labeled label="Label" {...args}/>,
  args: {
    defaultChecked: false,
  },
};

export const RadioLabeledDisabled: Story = {
  render: (args) => <Radio.Labeled label="Label" {...args}/>,
  args: {
    defaultChecked: false,
    disabled: true,
  },
};
