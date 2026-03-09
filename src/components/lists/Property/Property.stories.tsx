/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumParagraph, loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';

import { Property } from './Property.tsx';

type Story = StoryObj<typeof Property>;
type PropertyArgs = React.ComponentProps<typeof Property>;

const sizes = ['small', 'medium', 'large', 'full-size'] as const;

export default {
  component: Property,
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
    },

    expandable: { control: 'boolean' },

    clampLines: {
      control: { type: 'number', min: 1, max: 10 },
      if: { arg: 'expandable', truthy: true },
    },
  },

  args: {
    label: 'Editable Property',
    value: `${loremIpsumSentence} ${loremIpsumParagraph}`,
    size: 'large',
    expandable: true,
    clampLines: 3,
    unstyled: false,
  },

  render: (args) => <Property {...args} />,
} satisfies Meta<PropertyArgs>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small Property',
    value: 'Small Size Property',
    expandable: false,
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    label: 'Medium Property',
    value: 'Medium Size Property',
    expandable: false,
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Large Property',
    value: `${loremIpsumSentence}`,
    expandable: false,
  },
};

export const FullSize: Story = {
  args: {
    size: 'full-size',
    label: 'Full Size Property',
    value: `${loremIpsumParagraph}`,
  },
};

export const Expandable: Story = {
  args: {
    label: 'Expandable Property',
    value: `${loremIpsumParagraph} ${loremIpsumParagraph}`,
    size: 'full-size',
    expandable: true,
    clampLines: 3,
  },
};
