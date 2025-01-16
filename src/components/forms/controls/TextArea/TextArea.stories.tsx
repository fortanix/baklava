/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { TextArea } from './TextArea.tsx';

import cl from './TextArea.module.scss';

type TextAreaArgs = React.ComponentProps<typeof TextArea>;
type Story = StoryObj<TextAreaArgs>;

export default {
  component: TextArea,
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
  render: (args) => <TextArea {...args}/>,
} satisfies Meta<TextAreaArgs>;

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
    style: { width: 300 },
  },
};

export const AutomaticHorizontalResize: Story = {
  args: {
    automaticResize: true,
    defaultValue: longText,
    style: { height: 100 },
  },
};
