/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { RadioButtonField } from './RadioButtonField.tsx';


type RadioButtonFieldArgs = React.ComponentProps<typeof RadioButtonField>;
type Story = StoryObj<RadioButtonFieldArgs>;

export default {
  component: RadioButtonField,
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
  render: (args) => <RadioButtonField {...args}/>,
} satisfies Meta<RadioButtonFieldArgs>;


export const RadioButtonFieldWithLabel: Story = {
  args: {
    label: 'Label',
  },
};

export const RadioButtonFieldWithLabelAndTitle: Story = {
  args: {
    title: 'Title',
    label: 'Label',
  },
};

export const RadioButtonFieldWithLabelWithTitleWithTooltip: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
  }
};

export const RadioButtonFieldWithLabelWithTitleWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    optional: true,
  },
};

export const RadioButtonFieldWithLabelWithTitleWithTooltipWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
    optional: true,
  },
};

export const RadioButtonFieldWithLabelAndSublabel: Story = {
  args: {
    label: 'Label',
    sublabel: 'Supporting copy',
  },
};
