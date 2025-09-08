/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { RadioGroupField } from './RadioGroupField.tsx';


type RadioGroupFieldArgs = React.ComponentProps<typeof RadioGroupField>;
type Story = StoryObj<RadioGroupFieldArgs>;

export default {
  component: RadioGroupField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {},
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <RadioGroupField {...args}/>,
} satisfies Meta<RadioGroupFieldArgs>;


export const RadioGroupFieldWithLabel: Story = {
  args: {
    label: 'Label',
  },
};

export const RadioGroupFieldWithLabelAndTitle: Story = {
  args: {
    title: 'Title',
    label: 'Label',
  },
};

export const RadioGroupFieldWithLabelWithTitleWithTooltip: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
  }
};

export const RadioGroupFieldWithLabelWithTitleWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    optional: true,
  },
};

export const RadioGroupFieldWithLabelWithTitleWithTooltipWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
    optional: true,
  },
};

export const RadioGroupFieldWithLabelAndDescription: Story = {
  args: {
    label: 'Label',
    description: 'Additional description',
  },
};
