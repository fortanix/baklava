/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Checkbox } from './Checkbox.tsx';


type CheckboxArgs = React.ComponentProps<typeof Checkbox>;
type Story = StoryObj<CheckboxArgs>;

export default {
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<CheckboxArgs>;


const CheckboxField = () => {
  return (
    <label className="bk-checkbox-field">
      <Checkbox/>
      <span>Label</span>
    </label>
  );
};

export const Standard: Story = {
  render: () =>
    <div className="bk-checkbox-field-group">
      <CheckboxField/>
      <CheckboxField/>
      <CheckboxField/>
    </div>,
  play: async ({ canvasElement }) => {
    // const canvas = within(canvasElement);
  },
};
