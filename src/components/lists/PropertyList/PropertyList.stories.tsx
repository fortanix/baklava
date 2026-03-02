/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PropertyList } from './PropertyList.tsx';

import { loremIpsumParagraph } from '../../../util/storybook/LoremIpsum.tsx';

/**
 * Merge PropertyList + Property props
 * but omit children from auto-control exposure
 */
type PropertyListArgs =
  Omit<React.ComponentProps<typeof PropertyList>, 'children'> &
  React.ComponentProps<typeof PropertyList.Property> & {
    children?: React.ReactNode;
  };

type Story = StoryObj<PropertyListArgs>;

export default {
  component: PropertyList,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 10 }
    },

    // Editable Property Controls
    label: { control: 'text' },
    value: { control: 'text' },
    fullWidth: { control: 'boolean' },
    span: { control: { type: 'number', min: 1, max: 10 } },
    enableClamping: { control: 'boolean' },
    clampLines: {
      control: { type: 'number', min: 1, max: 10 },
      if: { arg: 'enableClamping', truthy: true },
    },

    // Hide children from controls panel
    children: {
      table: { disable: true },
    },
  },

  args: {
    columns: 2,

    label: 'Editable Property (Play with Controls)',
    value: `${loremIpsumParagraph} ${loremIpsumParagraph}`,
    fullWidth: false,
    span: 1,
    enableClamping: true,
    clampLines: 3,
  },

  render: (args) => {
    const {
      columns,
      children,
      label,
      value,
      fullWidth,
      span,
      enableClamping,
      clampLines,
    } = args;

    return (
      <PropertyList columns={columns ?? 2}>
        {children ? (
          children
        ) : (
          <>
            {/* Editable Property */}
            <PropertyList.Property
              label={label}
              value={value}
              {...(fullWidth !== undefined && { fullWidth })}
              {...(span !== undefined && { span })}
              {...(enableClamping !== undefined && { enableClamping })}
              {...(clampLines !== undefined && { clampLines })}
            />

            {/* Static Reference Properties */}
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
        )}
      </PropertyList>
    );
  },
} satisfies Meta<PropertyListArgs>;

export const Playground: Story = {};

export const OneColumn: Story = {
  args: {
    columns: 1,
    children: (
      <>
        <PropertyList.Property label="Key 1" value="Value 1" />
        <PropertyList.Property label="Key 2" value="Value 2" />
      </>
    ),
  },
};
export const TwoColumns: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <PropertyList.Property label="Key 1" value="Value 1" />
        <PropertyList.Property label="Key 2" value="Value 2" />
        <PropertyList.Property label="Key 3" value="Value 3" />
        <PropertyList.Property label="Key 4" value="Value 4" />
      </>
    ),
  },


};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <PropertyList.Property label="Key 1" value="Value 1" />
        <PropertyList.Property label="Key 2" value="Value 2" />
        <PropertyList.Property label="Key 3" value="Value 3" />
        <PropertyList.Property label="Key 4" value="Value 4" />
      </>
    ),
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
