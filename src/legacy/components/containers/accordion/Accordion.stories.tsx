/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Accordion } from './Accordion.tsx';


type AccordionArgs = React.ComponentProps<typeof Accordion>;
type Story = StoryObj<AccordionArgs>;

export default {
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


export const AccordionStandard: Story = {};

export const AccordionWithVariant: Story = {
  args: {
    variant: 'x',
  },
};
