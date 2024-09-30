/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { SolutionSelector } from './SolutionSelector.tsx';


type SolutionSelectorArgs = React.ComponentProps<typeof SolutionSelector>;
type Story = StoryObj<SolutionSelectorArgs>;

export default {
  component: SolutionSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <SolutionSelector {...args}/>,
} satisfies Meta<SolutionSelectorArgs>;


export const Standard: Story = {
  name: 'SolutionSelector',
};
