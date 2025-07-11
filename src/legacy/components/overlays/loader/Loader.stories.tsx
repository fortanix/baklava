/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';

import { Loader } from './Loader.tsx';


type LoaderArgs = React.ComponentProps<typeof Loader>;
type Story = StoryObj<LoaderArgs>;

export default {
  component: Loader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <>
        <LoremIpsum/>
        <Story/>
        <LoremIpsum/>
      </>
    )
  ],
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Loader {...args}/>,
} satisfies Meta<LoaderArgs>;


export const LoaderStandard: Story = {};

export const LoaderWithoutDelay: Story = {
  args: {
    delay: 0,
  },
};

export const LoaderWithBackdrop: Story = {
  args: {
    withBackdrop: true,
  },
};
