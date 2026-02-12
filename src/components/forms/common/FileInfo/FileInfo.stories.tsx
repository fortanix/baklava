/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { FileInfo } from './FileInfo.tsx';


type FileInfoArgs = React.ComponentProps<typeof FileInfo>;
type Story = StoryObj<FileInfoArgs>;

export default {
  component: FileInfo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    fileName: 'hello-world.txt',
  },
  decorators: [
  ],
  render: (args) => <FileInfo {...args}/>,
} satisfies Meta<FileInfoArgs>;

export const FileInfoStandard: Story = {};

export const FileInfoWithSize: Story = {
  args: {
    fileSize: 123456,
  },
};

export const FileInfoWithDeleteButton: Story = {
  args: {
    onDelete: () => {},
  },
};
