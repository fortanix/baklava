/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { loremIpsumParagraph, loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';

import { PropertyGrid } from './PropertyGrid.tsx';

// Merge PropertyList + Property props, but omit children from auto-control exposure
type PropertyGridArgs = Omit<React.ComponentProps<typeof PropertyGrid>, 'children'>
  & React.ComponentProps<typeof PropertyGrid.Property> & {
    children?: React.ReactNode,
  };

const sizes = ['small', 'medium', 'large', 'full-size'] as const;

type Story = StoryObj<PropertyGridArgs>;

export default {
  component: PropertyGrid,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },

    size: {
      control: 'select',
      options: sizes,
      description: 'Sizes determine how many columns a property spans within the row layout.',
      table: {
        type: {
          summary: `small: span 1 column 
          | medium: span 2 columns 
          | large: span 3 columns 
          | full-size: span all columns
          `,
        },
      },
    },

    expandable: { control: 'boolean' },

    clampLines: {
      control: { type: 'number', min: 1, max: 10 },
      if: { arg: 'expandable', truthy: true },
    },

    columns: {
      control: { type: 'number', min: 1, max: 10 },
    },

    // Hide children from controls panel
    children: {
      table: { disable: true },
    },
  },

  args: {
    label: 'Editable Property',
    value: `This is the editable value property from the editor. ${loremIpsumSentence}`,
    columns: 4,
    size: 'small',
    expandable: true,
    clampLines: 3,
    unstyled: false,
  },

  render: (args) => {
    const {
      children,
      columns,
      label,
      value,
      size,
      expandable,
      clampLines,
    } = args;

    return (
      <PropertyGrid columns={columns}>
        {children || (
          <>
            <PropertyGrid.Property
              label={label}
              value={value}
              size={size}
              expandable={expandable}
              clampLines={clampLines}
            />

            <PropertyGrid.Property
              label="Large (Span 3)"
              value="This is the large value property."
              size="large"
            />
            <PropertyGrid.Property
              label="Medium (Span 2)"
              value="This is the medium value property."
              size="medium"
            />
            <PropertyGrid.Property
              label="Small (Span 1)"
              value="This is the small value property."
              size="small"
            />
            <PropertyGrid.Property
              label="Full Size (Span all)"
              value="This is the full size value property."
              size="full-size"
            />
          </>
        )}
      </PropertyGrid>
    );
  },
} satisfies Meta<PropertyGridArgs>;

export const Playground: Story = {};

export const DifferentSizes: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <PropertyGrid.Property
          label="Large (Span 3)"
          value="This is the large value property."
          size="large"
        />
        <PropertyGrid.Property
          label="Small (Span 1)"
          value="This is the small value property."
          size="small"
        />
        <PropertyGrid.Property
          label="Medium (Span 2)"
          value="This is the medium value property."
          size="medium"
        />
        <PropertyGrid.Property
          label="Small (Span 1)"
          value="This is the small value property."
          size="small"
        />
        <PropertyGrid.Property
          label="Full Size (Span all)"
          value="This is the full size value property."
          size="full-size"
        />
      </>
    ),
  },
};

export const MixedLayout: Story = {
  args: {
    children: (
      <>
        <PropertyGrid.Property label="ID (Small - span 1)" value="12345" size="small" />
        <PropertyGrid.Property label="Owner (Medium - span 2)" value="This is the new owner John" size="medium" />
        <PropertyGrid.Property label="Status (Small - span 1)" value="Active" size="small" />
        <PropertyGrid.Property
          label="Notes (Full-Size - span all)"
          value={`${loremIpsumParagraph} ${loremIpsumParagraph}`}
          size="full-size"
          expandable
        />
        <PropertyGrid.Property
          label="Description (Large - span 3)"
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
        <PropertyGrid.Property
          label="Large (Span 3)"
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
        {Array.from({ length: 12 }, (_, index) => index + 1).map(index => {
          return (
            <PropertyGrid.Property
              key={index}
              label={`Key ${index}`}
              value={`Value ${index}`}
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
        {Array.from({ length: 12 }, (_, index) => index + 1).map(index => {
          const size = sizes[Math.floor(Math.random() * sizes.length)];

          return (
            <PropertyGrid.Property
              key={index}
              label={`Key ${index} (${size})`}
              value={`Value ${index}`}
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
        <PropertyGrid.Property
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
