/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';

import { Accordion } from './Accordion.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';


type AccordionArgs = React.ComponentProps<typeof Accordion>;
type Story = StoryObj<AccordionArgs>;

export default {
  component: Accordion,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/design/ymWCnsGfIsC2zCz17Ur11Z/Design-System-UX?node-id=5634-155879&node-type=instance' },
  },
  decorators: [
    Story => <LayoutDecorator size="small"><Story/></LayoutDecorator>,
  ],
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: (
      <LoremIpsum paragraphs={1}/>
    ),
    title: 'My Accordion',
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


export const Standard: Story = {};

export const DefaultOpen: Story = {
  args: {
    open: true,
    title: 'I should be open by default',
  },
};

export const WithFocusClosed: Story = {
  args: {
    open: false,
    summaryProps: { className: 'pseudo-focus-visible' },
    title: 'I should have a focus outline',
    children: <>The border radius on the outline should be on both top and bottom when closed.</>,
  },
};

export const WithFocusOpen: Story = {
  args: {
    open: true,
    summaryProps: { className: 'pseudo-focus-visible' },
    title: 'I should have a focus outline',
    children: <>The border radius on the outline should be only on the top when open.</>,
  },
};

export const WithTextOverflow: Story = {
  args: {
    title: 'An accordion with a long title that should cause text overflow',
  },
};

// Note: interesting quirk with the open/close animation. Because it's the `::details-content` that gets its height
// animated, if there is a lot of overflowing content, there is a visual delay in the close animation.
export const WithScroll: Story = {
  args: {
    open: true,
    title: 'An accordion with lots of content',
    children: <LoremIpsum paragraphs={6}/>,
    style: { maxHeight: '80svh' },
  },
};
