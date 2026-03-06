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
  
const sizes = ['small', 'medium', 'large', 'full-size'] as const;

type Story = StoryObj<PropertyListArgs>;

export default {
  component: PropertyList,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    label: { control: 'text' },
    value: { control: 'text' },

    size: {
      control: 'select',
      options: sizes,
    },

    expandable: { control: 'boolean' },

    clampLines: {
      control: { type: 'number', min: 1, max: 10 },
      if: { arg: 'expandable', truthy: true },
    },

    // Hide children from controls panel
    children: {
      table: { disable: true },
    },

  },

  args: {
    label: 'Editable Property',
    value: `${loremIpsumParagraph} ${loremIpsumParagraph}`,
    size: 'large',
    expandable: true,
    clampLines: 3,
  },

  render: (args) => {
    const {
      children,
      orientation,
      label,
      value,
      size,
      expandable,
      clampLines,
    } = args;

    return (
      <PropertyList orientation={orientation}>
        {children ? (
          children
        ) : (
          <>
            <PropertyList.Property
              label={label}
              value={value}
              size={size}
              expandable={expandable}
              clampLines={clampLines}
            />

            <PropertyList.Property
              label="Large"
              value="This is the large value property"
              size="large"
            />
            <PropertyList.Property
              label="Medium"
              value="This is the medium value property"
              size="medium"
            />
            <PropertyList.Property
              label="Small"
              value="This is the small value property"
              size="small"
            />
            <PropertyList.Property
              label="Full Size"
              value="This is the full size value property"
              size="full-size"
            />
          </>
        )}
      </PropertyList>
    );
  },
} satisfies Meta<PropertyListArgs>;

export const Playground: Story = {};

export const HorizontalSizes: Story = {
  args: {
    children: (
      <>
        <PropertyList.Property
              label="Large"
              value="This is the large value property"
              size="large"
            />
            <PropertyList.Property
              label="Medium"
              value="This is the medium value property"
              size="medium"
            />
            <PropertyList.Property
              label="Small"
              value="This is the small value property"
              size="small"
            />
            <PropertyList.Property
              label="Full Size"
              value="This is the full size value property"
              size="full-size"
            />
      </>
    ),
  },
};

export const VerticalOrientation: Story = {
  args: {
    orientation: 'vertical',
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

export const MixedLayout: Story = {
  args: {
    children: (
      <>
        <PropertyList.Property label="ID (Small)" value="12345" size="small" />
        <PropertyList.Property label="Owner (Medium)" value="This is the new owner John" size="medium" />
        <PropertyList.Property label="Status (Small)" value="Active" size="small" />
        <PropertyList.Property
          label="Notes (Full-Size)"
          value={`${loremIpsumParagraph} ${loremIpsumParagraph}`}
          size="full-size"
          expandable
        />
        <PropertyList.Property
          label="Description (Large)"
          value={`${loremIpsumParagraph}`}
          size="large"
        />
      </>
    ),
  },
};

export const LongWord: Story = {
  args: {
    children: (
      <>
        <PropertyList.Property
          label="Large"
          value="ThisIsAVeryVeryVeryVeryVeryLongStringWithoutSpaces"
          size="large"
        />
      </>
    ),
  },
};

export const ManyProperties: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => {
          return (
            <PropertyList.Property
              key={i}
              label={`Key ${i + 1}`}
              value={`Value ${i + 1}`}
            />
          );
        })}
      </>
    ),
  },
};

export const ManyPropertiesWithDifferentRandomSizes: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => {
          const size = sizes[Math.floor(Math.random() * sizes.length)];

          return (
            <PropertyList.Property
              key={i}
              label={`Key ${i + 1} (${size})`}
              value={`Value ${i + 1}`}
              size={size}
            />
          );
        })}
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
          size="full-size"
          expandable
          clampLines={3}
        />
      </>
    ),
  },
};
export const PropertyListStandard: Story = {};
