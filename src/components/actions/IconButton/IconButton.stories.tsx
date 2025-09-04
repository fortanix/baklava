/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { IconButton } from './IconButton.tsx';


type IconButtonArgs = React.ComponentProps<typeof IconButton>;
type Story = StoryObj<IconButtonArgs>;

export default {
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    'aria-label': 'Visible',
    icon: 'eye-open',
    onPress: () => { notify.info(`You clicked the icon button`); },
  },
  render: (args) => <IconButton {...args}/>,
} satisfies Meta<IconButtonArgs>;


export const IconButtonStandard: Story = {};
