/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ToastProvider } from './ToastProvider.tsx';


type ToastProviderArgs = React.ComponentProps<typeof ToastProvider>;
type Story = StoryObj<ToastProviderArgs>;

export default {
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <ToastProvider {...args}/>,
} satisfies Meta<ToastProviderArgs>;


export const ToastProviderStandard: Story = {};
