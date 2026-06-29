/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { LayoutDecorator } from '../../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsumParagraph } from '../../../../util/storybook/LoremIpsum.tsx';

import { TextAreaWithFileUpload } from './TextAreaWithFileUpload.tsx';

type TextAreaWithFileUploadArgs = React.ComponentProps<typeof TextAreaWithFileUpload>;
type Story = StoryObj<TextAreaWithFileUploadArgs>;

export default {
  component: TextAreaWithFileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    placeholder: 'Example',
    accept: '.txt,.json,.yaml,.pdf,.png',
    disabled: false,
    enableDragAndDrop: true,
    maxSize: 2,
    style: { blockSize: 110 },
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => {
    const [value, setValue] = React.useState(
      args.defaultValue ?? ''
    );

    return (
      <TextAreaWithFileUpload
        {...args}
        value={args.value ?? value}
        onChange={(e) => {
          setValue(e.target.value);
          args.onChange?.(e);
        }}
      />
    );
  },
} satisfies Meta<TextAreaWithFileUploadArgs>;

const longText = `A really
long
text
that
spans
several
lines`;

export const Placeholder: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: 'Some text',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DropDisabled: Story = {
  args: {
    enableDragAndDrop: false,
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const ScrollBar: Story = {
  args: {
    defaultValue: longText,
  },
};

export const AutomaticResize: Story = {
  args: {
    automaticResize: true,
  },
};

export const AutomaticVerticalResize: Story = {
  args: {
    automaticResize: true,
    defaultValue: longText,
    style: { inlineSize: 300 },
  },
};

export const AutomaticHorizontalResize: Story = {
  args: {
    automaticResize: true,
    defaultValue: longText,
    style: { blockSize: 100 },
  },
};

export const WithLongText: Story = {
  args: {
    defaultValue: loremIpsumParagraph,
  },
  decorators: [Story => <LayoutDecorator size="small" resize="both"><Story/></LayoutDecorator>],
};
