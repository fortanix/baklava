/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Accordion } from './Accordion.tsx';


type AccordionArgs = React.ComponentProps<typeof Accordion>;
type Story = StoryObj<AccordionArgs>;

export default {
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  decorators: [
    // FIXME: should be responsive and shrink to below 500px, but `max-width` doesn't quite work here since we're
    // using flex box will shrink to max-content by default.
    Story => <div style={{ width: 500 }}><Story/></div>,
  ],
  args: {
    children: (
      <>
        <Accordion.Item title="Title 1"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="Title 2"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="Title 3"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="An item with a very long title that should cause text overflow">
          <LoremIpsum paragraphs={3}/>
        </Accordion.Item>
      </>
    ),
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


export const ExclusiveAccordion: Story = {
  args: {
    children: (
      <>
        <Accordion.Item open title="Only one of these items can be open">
          <LoremIpsum/>
        </Accordion.Item>
        <Accordion.Item title="Title 2"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="Title 3"><LoremIpsum/></Accordion.Item>
      </>
    ),
  }
};
export const NonexclusiveAccordion: Story = {
  args: {
    exclusive: false,
    children: (
      <>
        <Accordion.Item title="Multiple of these can be open at the same time">
          <LoremIpsum short/>
        </Accordion.Item>
        <Accordion.Item open title="I am open by default"><LoremIpsum short/></Accordion.Item>
        <Accordion.Item open title="I am also open by default"><LoremIpsum short/></Accordion.Item>
      </>
    ),
  },
};

export const WithFocus: Story = {
  args: {
    children: (
      <>
        <Accordion.Item title="Title 1"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="Title 2"><LoremIpsum/></Accordion.Item>
        <Accordion.Item
          title="I should have a focus outline"
          summaryProps={{ className: 'pseudo-focus-visible' }}
        >
          <LoremIpsum/>
        </Accordion.Item>
      </>
    ),
  },
};

export const WithScroll: Story = {
  args: {
    children: (
      <>
        <Accordion.Item
          style={{
            //maxHeight: '...', // Doesn't work in browsers w/o for support `::details-content`, see `Disclosure` scss
            '--bk-disclosure-max-height': '13.8lh', // Choose a value that shows the text cut off
          }}
          open
          title="The content below should be scrollable"
        >
          <LoremIpsum paragraphs={3}/>
        </Accordion.Item>
        <Accordion.Item title="Title 2"><LoremIpsum/></Accordion.Item>
        <Accordion.Item title="Title 3"><LoremIpsum/></Accordion.Item>
      </>
    ),
  },
};
