/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { AccountSelector } from './AccountSelector.tsx';


type AccountSelectorArgs = React.ComponentProps<typeof AccountSelector>;
type Story = StoryObj<AccountSelectorArgs>;

export default {
  component: AccountSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <AccountSelector {...args}/>,
} satisfies Meta<AccountSelectorArgs>;


export const Standard: Story = {
  name: 'AccountSelector',
};
