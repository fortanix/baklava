/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner.tsx';


type SpinnerArgs = React.ComponentProps<typeof Spinner>;
type Story = StoryObj<typeof Spinner>;

export default {
  component: Spinner,
  parameters: {
    layout: 'centered',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => (
    <Spinner {...args}/>
  ),
} satisfies Meta<SpinnerArgs>;


export const SpinnerSmall: Story = {
  name: 'Spinner Small',
  args: {
    size: 'small',
  },
};

export const SpinnerMedium: Story = {
  name: 'Spinner Medium',
  args: {
    size: 'medium',
  },
};

export const SpinnerLarge: Story = {
  name: 'Spinner Large',
  args: {
    size: 'large',
  },
};

export const SpinnerInline: Story = {
  name: 'Spinner Inline',
  render: () => (
    <p>Lorem ipsum sit dolor amet...<Spinner inline={true}/></p>
  ),
}
