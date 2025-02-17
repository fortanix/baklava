/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { SegmentedControl } from './SegmentedControl.tsx';


type SegmentedControlArgs = React.ComponentProps<typeof SegmentedControl>;
type Story = StoryObj<SegmentedControlArgs>;

export default {
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Choose a color',
    defaultButtonKey: 'red',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
  render: (args) => <SegmentedControl {...args}/>,
} satisfies Meta<SegmentedControlArgs>;


export const SegmentedControlStandard: Story = {};

export const SegmentedControlHover: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red" className="pseudo-hover"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlFocused: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red" className="pseudo-focus-visible"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const SegmentedControlDisabledOne: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" disabled/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};
