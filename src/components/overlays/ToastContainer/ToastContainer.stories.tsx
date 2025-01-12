/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ToastContainer } from './ToastContainer.tsx';


type ToastContainerArgs = React.ComponentProps<typeof ToastContainer>;
type Story = StoryObj<ToastContainerArgs>;

export default {
  component: ToastContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <ToastContainer {...args}/>,
} satisfies Meta<ToastContainerArgs>;


export const ToastContainerStandard: Story = {};
