/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { RadioField } from './RadioField.tsx';


type RadioFieldArgs = React.ComponentProps<typeof RadioField>;
type Story = StoryObj<RadioFieldArgs>;

export default {
  component: RadioField,
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
  render: (args) => <RadioField {...args}/>,
} satisfies Meta<RadioFieldArgs>;


export const RadioFieldWithLabel: Story = {
  args: {
    label: 'Label',
  },
};

export const RadioFieldWithLabelAndTitle: Story = {
  args: {
    title: 'Title',
    label: 'Label',
  },
};

export const RadioFieldWithLabelWithTitleWithTooltip: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
  }
};

export const RadioFieldWithLabelWithTitleWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    optional: true,
  },
};

export const RadioFieldWithLabelWithTitleWithTooltipWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
    optional: true,
  },
};

export const RadioFieldWithLabelAndDescription: Story = {
  args: {
    label: 'Label',
    description: 'Additional description',
  },
};
