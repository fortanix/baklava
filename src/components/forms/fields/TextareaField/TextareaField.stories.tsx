/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, fireEvent, within } from '@storybook/test';
import * as React from 'react';

import { Form } from '../../context/Form/Form.tsx';

import { TextareaField } from './TextareaField.tsx';


type TextareaArgs = React.ComponentProps<typeof TextareaField>;
type Story = StoryObj<TextareaArgs>;

export default {
  component: TextareaField,
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
  render: (args) => <TextareaField {...args}/>,
} satisfies Meta<TextareaArgs>;

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
