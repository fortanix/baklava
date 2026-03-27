/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DialogLayout } from './DialogLayout.tsx';

import './DialogLayoutLogo_stories.scss';

type Story = StoryObj<typeof DialogLayout.Logo>;

export default {
  tags: ['autodocs'],
  component: DialogLayout.Logo,
  parameters: {
    layout: 'centered',
  },
  args: {
    subtitle: 'Armor',
    subtitleTrademark: true,
  },
} satisfies Meta<typeof DialogLayout.Logo>;

export const Default: Story = {
  render: (args) => <DialogLayout.Logo {...args} />,
};

export const WithoutTrademark: Story = {
  args: {
    subtitleTrademark: false,
  },
};

export const WithoutSubtitle: Story = {
  args: {
    subtitle: undefined,
    subtitleTrademark: false,
  },
};

export const CustomSubtitle: Story = {
  args: {
    subtitle: 'Key Insight',
    subtitleClassName: 'custom-subtitle',
  },
};
