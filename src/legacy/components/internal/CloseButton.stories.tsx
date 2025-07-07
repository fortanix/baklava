/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { CloseButton } from './CloseButton.tsx';


type CloseButtonArgs = React.ComponentProps<typeof CloseButton>;
type Story = StoryObj<CloseButtonArgs>;

export default {
  component: CloseButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {},
  render: (args) => <CloseButton {...args}/>,
} satisfies Meta<CloseButtonArgs>;


export const CloseButtonStandard: Story = {};

export const CloseButtonSmall: Story = { args: { small: true } };
