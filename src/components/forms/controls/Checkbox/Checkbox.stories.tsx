/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Checkbox } from './Checkbox.tsx';

import cl from './Checkbox.module.scss';


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
  args: {},
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Checkbox {...args}/>,
} satisfies Meta<CheckboxArgs>;


export const Unchecked: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: {
    defaultChecked: false,
    indeterminate: true,
  },
};

export const DisabledUnchecked: Story = {
  name: 'Disabled (unchecked)',
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  name: 'Disabled (checked)',
  args: {
    defaultChecked: true,
    disabled: true,
  },
};

export const DisabledIndeterminate: Story = {
  name: 'Disabled (indeterminate)',
  args: {
    defaultChecked: false,
    disabled: true,
    indeterminate: true,
  },
};

export const FocusedUnchecked: Story = {
  name: 'Focused (unchecked)',
  args: {
    className: cl['pseudo-focused'],
  },
};

export const FocusedChecked: Story = {
  name: 'Focused (checked)',
  args: {
    className: cl['pseudo-focused'],
    defaultChecked: true,
  },
};

export const FocusedIndeterminate: Story = {
  name: 'Focused (indeterminate)',
  args: {
    className: cl['pseudo-focused'],
    defaultChecked: false,
    indeterminate: true,
  },
};

export const FocusedDisabledUnchecked: Story = {
  name: 'Focused & Disabled (unchecked)',
  args: {
    className: cl['pseudo-focused'],
    disabled: true,
  },
};

export const FocusedDisabledChecked: Story = {
  name: 'Focused & Disabled (checked)',
  args: {
    className: cl['pseudo-focused'],
    defaultChecked: true,
    disabled: true,
  },
};

export const FocusedDisabledIndeterminate: Story = {
  name: 'Focused & Disabled (indeterminate)',
  args: {
    className: cl['pseudo-focused'],
    defaultChecked: false,
    disabled: true,
    indeterminate: true,
  },
};
