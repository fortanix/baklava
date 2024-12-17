/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

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
  args: {
    children: (
      <>
        <AccordionGroup.Accordion title="Title 1">Content</AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 2">Content</AccordionGroup.Accordion>
        <AccordionGroup.Accordion title="Title 3">Content</AccordionGroup.Accordion>
      </>
    ),
  },
  render: (args) => <AccordionGroup {...args}/>,
} satisfies Meta<AccordionGroupArgs>;


export const Standard: Story = {
  name: 'AccordionGroup',
};
