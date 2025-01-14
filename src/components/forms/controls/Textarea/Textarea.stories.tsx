/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { delay } from '../../../../util/time.ts';

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, fireEvent, within } from '@storybook/test';

import * as React from 'react';

import { Textarea } from './Textarea.tsx';

import cl from './Textarea.module.scss';

type TextareaArgs = React.ComponentProps<typeof Textarea>;
type Story = StoryObj<TextareaArgs>;

export default {
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    placeholder: 'Example',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Textarea {...args}/>,
} satisfies Meta<TextareaArgs>;

export const Standard: Story = {
};

export const Focused: Story = {
  args: {
    className: cl['pseudo-focused'],
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const AutomaticResize: Story = {
  args: {
    automaticResize: true,
  },
};
