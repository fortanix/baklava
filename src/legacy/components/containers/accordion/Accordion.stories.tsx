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
    layout: 'padded',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


const items1 = [
  { title: 'Item 1', content: 'Item content' },
  { title: 'Item 2', content: 'Item content' },
  { title: 'Item 3', content: 'Item content' },
];

export const AccordionStandard: Story = {
  args: {
    items: items1,
  },
};

export const AccordionWithDefaultOpen: Story = {
  args: {
    items: [
      { title: 'Item 1', content: 'Item content' },
      { title: 'Item 2', content: 'This should be open by default', openByDefault: true },
      { title: 'Item 3', content: 'Item content' },
    ],
  },
};

export const AccordionWithFocus: Story = {
  args: {
    items: [
      { title: 'Item 1', content: 'Item content' },
      { title: 'Item 2', content: 'This should be focused', openByDefault: true, className: 'pseudo-focus-visible' },
      { title: 'Item 3', content: 'Item content' },
    ],
  },
};

export const AccordionSmall: Story = {
  args: {
    items: items1,
    size: 'small',
  },
};
