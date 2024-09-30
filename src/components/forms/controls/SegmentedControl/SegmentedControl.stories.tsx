/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

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
    options: ['Test1', 'Test2', 'Test3'],
  },
  render: (args) => <SegmentedControl {...args}/>,
} satisfies Meta<SegmentedControlArgs>;

const BaseStory: Story = {
  args: {},
  render: (args) => <SegmentedControl {...args}/>,
};

const baseOptions = [
  {
    value: 'test1',
    label: 'Test1',
  },
  {
    value: 'test2',
    label: 'Test2',
  },
  {
    value: 'test3',
    label: 'Test3',
  },
];

export const Standard: Story = {
  ...BaseStory,
  name: 'SegmentedControl [standard]',
};

export const StandardHover: Story = {
  ...BaseStory,
  name: 'SegmentedControl [hover]',
  args: {
    ...BaseStory.args,
    options: baseOptions.map((option, index) => {
      if (index === 1) {
        return {
          ...option,
          className: 'pseudo-hover',
        }
      }
      return option;
    }),
  },
};

export const StandardFocus: Story = {
  ...BaseStory,
  name: 'SegmentedControl [focus]',
  args: {
    ...BaseStory.args,
    options: baseOptions.map((option, index) => {
      if (index === 1) {
        return {
          ...option,
          className: 'pseudo-focus-visible',
        }
      }
      return option;
    }),
  },
};

export const StandardAllDisabled: Story = {
  ...BaseStory,
  name: 'SegmentedControl [disabled]',
  args: { ...BaseStory.args, disabled: true },
};
