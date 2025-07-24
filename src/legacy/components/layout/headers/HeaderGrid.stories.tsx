/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { AccountSwitcher, HeaderGrid } from './HeaderGrid.tsx';


type HeaderGridArgs = React.ComponentProps<typeof HeaderGrid>;
type Story = StoryObj<HeaderGridArgs>;

export default {
  component: HeaderGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {},
  render: (args) => <HeaderGrid {...args}/>,
} satisfies Meta<HeaderGridArgs>;


export const HeaderGridStandard: Story = {
  args: {
    children: (
      <>
        <AccountSwitcher onClick={() => {}}/>
      </>
    ),
  }
};
