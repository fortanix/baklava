/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { CheckboxField } from './CheckboxField.tsx';


type CheckboxFieldArgs = React.ComponentProps<typeof CheckboxField>;
type Story = StoryObj<CheckboxFieldArgs>;

export default {
  component: CheckboxField,
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
  render: (args) => <CheckboxField {...args}/>,
} satisfies Meta<CheckboxFieldArgs>;


export const CheckboxFieldWithLabel: Story = {
  args: {
    label: 'Label',
  },
};

export const CheckboxFieldWithLabelAndTitle: Story = {
  args: {
    title: 'Title',
    label: 'Label',
  },
};

export const CheckboxFieldWithLabelWithTitleWithTooltip: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
  }
};

export const CheckboxFieldWithLabelWithTitleWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleOptional: true,
  },
};

export const CheckboxFieldWithLabelWithTitleWithTooltipWithOptional: Story = {
  args: {
    title: 'Title',
    label: 'Label',
    titleTooltip: 'This is a tooltip',
    titleOptional: true,
  },
};

export const CheckboxFieldWithLabelAndDescription: Story = {
  args: {
    label: 'Label',
    description: 'Additional description',
  },
};
