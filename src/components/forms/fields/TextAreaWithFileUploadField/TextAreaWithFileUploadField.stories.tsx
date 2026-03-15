/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { Form } from '../../context/Form/Form.tsx';

import { TextAreaWithFileUploadField } from './TextAreaWithFileUploadField.tsx';


type TextAreaWithFileUploadFieldArgs = React.ComponentProps<typeof TextAreaWithFileUploadField>;
type Story = StoryObj<TextAreaWithFileUploadFieldArgs>;

export default {
  component: TextAreaWithFileUploadField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Label',
    placeholder: 'Example',
  },
  decorators: [
    Story => <Form><Story /></Form>,
  ],
  render: (args) => {
    const [value, setValue] = React.useState(
      args.defaultValue ?? ''
    );

    return <TextAreaWithFileUploadField {...args}
      value={args.value ?? value}
      onChange={(e) => {
        setValue(e.target.value);
        args.onChange?.(e);
      }}
    />
  },
} satisfies Meta<TextAreaWithFileUploadFieldArgs>;

export const Standard: Story = {};

export const Optional: Story = {
  args: {
    optional: true,
  },
};

export const WithHint: Story = {
  args: {
    hint: 'Hint/error',
  },
};

export const OptionalWithHint: Story = {
  args: {
    optional: true,
    hint: 'Hint/error',
  },
};

export const ScrollBar: Story = {
  args: {
    defaultValue: `A really
long
text
that
spans
several
lines`,
    hint: 'Hint/error',
  },
};
