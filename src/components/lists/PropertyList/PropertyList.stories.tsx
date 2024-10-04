/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { PropertyList } from './PropertyList.tsx';


type PropertyListArgs = React.ComponentProps<typeof PropertyList>;
type Story = StoryObj<typeof PropertyList>;

export default {
  component: PropertyList,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
  },
  render: (args) => <PropertyList {...args}/>,
} satisfies Meta<PropertyListArgs>;


export const Standard: Story = {
  args: {
    children: (
      <>
        <PropertyList.Property
          label="Key 1"
          value="Value 1"
        />
        <PropertyList.Property
          label="Key 2"
          value="Value 2"
        />
      </>
    ),
  },
};
