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
    Story => <div style={{ maxWidth: 500 }}><Story/></div>,
  ],
  args: {
    children: (
      <>
        <Accordion.Disclosure title="Title 1"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure title="Title 2"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure title="Title 3"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure title="An accordion with a very long title that should cause text overflow">
          <LoremIpsum paragraphs={3}/>
        </Accordion.Disclosure>
      </>
    ),
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


export const ExclusiveAccordion: Story = {
  args: {
    children: (
      <>
        <Accordion.Disclosure title="Only one of these accordions can be open">
          <LoremIpsum/>
        </Accordion.Disclosure>
        <Accordion.Disclosure title="Title 2"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure title="Title 3"><LoremIpsum/></Accordion.Disclosure>
      </>
    ),
  }
};
export const NonexclusiveAccordion: Story = {
  args: {
    exclusive: false,
    children: (
      <>
        <Accordion.Disclosure title="Multiple of these can be open at the same time">
          <LoremIpsum short/>
        </Accordion.Disclosure>
        <Accordion.Disclosure open title="I am open by default"><LoremIpsum short/></Accordion.Disclosure>
        <Accordion.Disclosure open title="I am also open by default"><LoremIpsum short/></Accordion.Disclosure>
      </>
    ),
  },
};

export const WithFocus: Story = {
  args: {
    children: (
      <>
        <Accordion.Disclosure title="Title 1"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure title="Title 2"><LoremIpsum/></Accordion.Disclosure>
        <Accordion.Disclosure
          title="I should have a focus outline"
          summaryProps={{ className: 'pseudo-focus-visible' }}
        >
          <LoremIpsum/>
        </Accordion.Disclosure>
      </>
    ),
  },
};
