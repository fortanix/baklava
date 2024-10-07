/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { ProgressBar } from './ProgressBar.tsx';


type ProgressBarArgs = React.ComponentProps<typeof ProgressBar>;
type Story = StoryObj<ProgressBarArgs>;

export default {
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {},
  render: (args) => <ProgressBar {...args}/>,
} satisfies Meta<ProgressBarArgs>;


export const ProgressBarWithOptionalAttributes = {
  name: 'Progress Bar with optional attributes',
  args: {
    progress: 50,
    label: 'Label',
    hintText: 'Hint text',
  }
}

export const ProgressBar0: Story = {
  name: 'Progress Bar on 0%',
  args: {
    progress: 0,
  }
};

export const ProgressBar25: Story = {
  name: 'Progress Bar on 25%',
  args: {
    progress: 25,
  }
};

export const ProgressBar50: Story = {
  name: 'Progress Bar on 50%',
  args: {
    progress: 50,
  }
};

export const ProgressBar75: Story = {
  name: 'Progress Bar on 75%',
  args: {
    progress: 75,
  }
};

export const ProgressBar100: Story = {
  name: 'Progress Bar on 100%',
  args: {
    progress: 100,
  }
};
