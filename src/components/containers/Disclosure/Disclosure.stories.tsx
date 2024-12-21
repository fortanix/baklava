/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';

import { Disclosure } from './Disclosure.tsx';


type DisclosureArgs = React.ComponentProps<typeof Disclosure>;
type Story = StoryObj<DisclosureArgs>;

export default {
  component: Disclosure,
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
    title: 'My Disclosure',
  },
  render: (args) => <Disclosure {...args}/>,
} satisfies Meta<DisclosureArgs>;


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
    children: <>When closed, the focus outline should have a border radius on all sides.</>,
  },
};

export const WithFocusOpen: Story = {
  args: {
    open: true,
    summaryProps: { className: 'pseudo-focus-visible' },
    title: 'I should have a focus outline',
    children: <>When open, the focus outline should have a border radius on the top only.</>,
  },
};

export const WithTextOverflow: Story = {
  args: {
    title: 'A long title that should cause text overflow with an ellipsis',
  },
};

// Note: interesting quirk with the open/close animation. Because it's the `::details-content` that gets its height
// animated, if there is a lot of overflowing content, there is a visual delay in the close animation.
export const WithScroll: Story = {
  args: {
    open: true,
    title: 'A disclosure with scrollable content',
    children: <LoremIpsum paragraphs={3}/>,
    style: {
      //maxHeight: '30rem', // Doesn't work in browsers that don't support `::details-content`
      // @ts-ignore
      '--bk-disclosure-max-height': '30rem',
    },
  },
};
