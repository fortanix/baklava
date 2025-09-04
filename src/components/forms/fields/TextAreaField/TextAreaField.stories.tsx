/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { Form } from '../../context/Form/Form.tsx';

import { TextAreaField } from './TextAreaField.tsx';


type TextAreaArgs = React.ComponentProps<typeof TextAreaField>;
type Story = StoryObj<TextAreaArgs>;

export default {
  component: TextAreaField,
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
    Story => <Form><Story/></Form>,
  ],
  render: (args) => <TextAreaField {...args}/>,
} satisfies Meta<TextAreaArgs>;

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
