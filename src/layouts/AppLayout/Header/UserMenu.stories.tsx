/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { UserMenu } from './UserMenu.tsx';


type UserMenuArgs = React.ComponentProps<typeof UserMenu>;
type Story = StoryObj<UserMenuArgs>;

export default {
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    userName: 'Anand Kashyap',
  },
  render: (args) => <UserMenu {...args}/>,
} satisfies Meta<UserMenuArgs>;


export const Standard: Story = {
  name: 'UserMenu',
};
