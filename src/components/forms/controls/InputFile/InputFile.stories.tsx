/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { InputFile, readFile } from './InputFile.tsx';

import { FileInfo } from '../../common/FileInfo/FileInfo.tsx';


type InputFileArgs = React.ComponentProps<typeof InputFile>;
type Story = StoryObj<InputFileArgs>;

export default {
  component: InputFile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  decorators: [
    // a simple decorator to be able to see the component see file properties after file selection
    (Story, context) => {
      const [fileName, setFileName] = React.useState('');
      const [fileSize, setFileSize] = React.useState(0);
      const handleFiles = (files: FileList) => {
        if (files && files[0]) {
          readFile(files[0], (result, file, error) => {
            if (!result || typeof result !== 'string' || error) {
              console.error('Failed to parse file');
              return;
            }
            setFileName(file.name);
            setFileSize(file.size);
          });
        }
      };
      
      return (
        <>
          <Story
            args={{
              ...context.args,
              handleFiles,
            }}
          />
          <FileInfo
            fileName={fileName}
            fileSize={fileSize}
            onDelete={() => {
              setFileName('');
              setFileSize(0);
            }}
          />
        </>
      );
    },
  ],
  render: (args) => <InputFile {...args}/>,
} satisfies Meta<InputFileArgs>;

export const InputFileStandard: Story = {};

export const InputFileWithDrag: Story = {
  args: {
    dragAndDrop: true,
  },
};

export const InputFileAcceptTxtOnly: Story = {
  args: {
    accept: '.txt',
  },
};

export const InputFileWithDragAcceptPdfOnly: Story = {
  args: {
    accept: '.pdf',
    dragAndDrop: true,
  },
};

export const InputFileWithDragAcceptJpgAndPng: Story = {
  args: {
    accept: '.jpg,.png',
    dragAndDrop: true,
  },
};

export const InputFileWithDragAcceptImageFormats: Story = {
  args: {
    accept: 'image/*',
    dragAndDrop: true,
  },
};

export const InputFileWithDragAcceptMimeTypePdf: Story = {
  args: {
    accept: 'application/pdf',
    dragAndDrop: true,
  },
};

export const InputFileWithDragAcceptImageFormatsWithFormatsHidden: Story = {
  args: {
    accept: 'image/*',
    acceptVisible: false,
    dragAndDrop: true,
  },
};
