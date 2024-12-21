/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { AccordionGroup } from './AccordionGroup.tsx';


type AccordionGroupArgs = React.ComponentProps<typeof AccordionGroup>;
type Story = StoryObj<AccordionGroupArgs>;

export default {
  component: AccordionGroup,
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
        <AccordionGroup.Accordion title="Title 1"><LoremIpsum/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 2"><LoremIpsum/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 3"><LoremIpsum/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="An accordion with a very long title that should cause text overflow">
          <LoremIpsum paragraphs={3}/>
        </AccordionGroup.Accordion>
      </>
    ),
  },
  render: (args) => <AccordionGroup {...args}/>,
} satisfies Meta<AccordionGroupArgs>;


export const ExclusiveAccordionGroup: Story = {
  args: {
    children: (
      <>
        <AccordionGroup.Accordion title="Only one of these accordions can be open">
          <LoremIpsum/>
        </AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 2"><LoremIpsum/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 3"><LoremIpsum/></AccordionGroup.Accordion>
      </>
    ),
  }
};
export const IndependentAccordionGroup: Story = {
  args: {
    exclusive: false,
    children: (
      <>
        <AccordionGroup.Accordion title="Multiple of these can be open at the same time">
          <LoremIpsum short/>
        </AccordionGroup.Accordion>
        <AccordionGroup.Accordion open title="I am open"><LoremIpsum short/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion open title="I am also open"><LoremIpsum short/></AccordionGroup.Accordion>
      </>
    ),
  },
};

export const WithFocus: Story = {
  args: {
    children: (
      <>
        <AccordionGroup.Accordion
          title="I should have a focus outline"
          summaryProps={{ className: 'pseudo-focus-visible' }}
        >
          <LoremIpsum/>
        </AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 2"><LoremIpsum/></AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 3"><LoremIpsum/></AccordionGroup.Accordion>
      </>
    ),
  },
};
