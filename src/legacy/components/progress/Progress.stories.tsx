/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ProgressBar } from './Progress.tsx';


type ProgressBarArgs = React.ComponentProps<typeof ProgressBar>;
type Story = StoryObj<ProgressBarArgs>;

export default {
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <ProgressBar {...args}/>,
} satisfies Meta<ProgressBarArgs>;


export const ProgressBarStandard: Story = {
  render: () => (
    <>
      <ProgressBar percent={30} info="30%"/>
      <ProgressBar percent={70} info="700/1000"/>
      <ProgressBar percent={90} info="9000/10000" infoMinWidth="100px"/>
    </>
  ),
};
