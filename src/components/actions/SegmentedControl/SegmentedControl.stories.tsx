/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedControl } from './SegmentedControl.tsx';


type SegmentedControlArgs = React.ComponentProps<typeof SegmentedControl>;
type Story = StoryObj<SegmentedControlArgs>;

export default {
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <SegmentedControl {...args}/>,
} satisfies Meta<SegmentedControlArgs>;


export const SegmentedControlStandard: Story = {
  args: {
    'aria-label': 'Color',
    defaultSelected: 'blue',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};
