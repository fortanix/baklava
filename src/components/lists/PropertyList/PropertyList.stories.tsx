/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PropertyList } from './PropertyList.tsx';

import { loremIpsumParagraph } from '../../../util/storybook/LoremIpsum.tsx';

type PropertyListArgs = React.ComponentProps<typeof PropertyList>;
type Story = StoryObj<typeof PropertyList>;

export default {
  component: PropertyList,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
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
        <PropertyList.Property
          label="Key 3"
          value="Value 3"
        />
        <PropertyList.Property
          label="Key 4"
          value="Value 4"
        />
      </>
    ),
  },
  render: (args) => <PropertyList {...args} />,
} satisfies Meta<PropertyListArgs>;

export const OneColumn: Story = {};

export const TwoColumns: Story = {
  args: {
    columns: 2,
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
  },
};

export const ThreeColumnsWithPropertySpanSupport: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <PropertyList.Property
          fullWidth
          label="Full-width"
          value="Takes 100% width of row"
        />
        <PropertyList.Property
          label="Key 1"
          value="Value 1"
        />
        <PropertyList.Property
          label="Key 2"
          value="Value 2"
        />
        <PropertyList.Property
          span={2}
          label="Main Content"
          value="Takes 75% width"
        />
        <PropertyList.Property
          label="Sidebar"
          value="Takes 25% width"
        />
        <PropertyList.Property
          label="Key 3"
          value="Value 3"
        />
        <PropertyList.Property
          label="Key 4"
          value="Value 4"
        />
        <PropertyList.Property
          label="Key 5"
          value="Value 5"
        />
      </>
    ),
  },
};

export const ThreeColumnsWithLargePropertySpanSupport: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <PropertyList.Property
          fullWidth
          label="Full-width"
          value="Takes 100% width of row"
        />
        <PropertyList.Property
          label="Key 1"
          value="Value 1"
        />
        <PropertyList.Property
          label="Key 2"
          value="Value 2"
        />
        <PropertyList.Property
          span={2}
          label="Main Content"
          value="Takes 75% width"
        />
        <PropertyList.Property
          label="Sidebar"
          value="Takes 25% width"
        />
        <PropertyList.Property
          label="Key 3"
          value="Value 3"
        />
        <PropertyList.Property
          label="Key 4"
          value="Value 4"
        />
        <PropertyList.Property
          label="Key 5"
          value="Value 5"
        />
        <PropertyList.Property
          label="View More"
          value={`${loremIpsumParagraph} ${loremIpsumParagraph}`}
          span={2}
          enableClamping
          clampLines={3}
        />
      </>
    ),
  },
};

export const WithViewMore: Story = {
  args: {
    children: (
      <>
        <PropertyList.Property
          label="View More"
          value={`${loremIpsumParagraph} ${loremIpsumParagraph}`}
          enableClamping
          clampLines={3}
        />
      </>
    ),
  },
};

export const PropertyListStandard: Story = {};
