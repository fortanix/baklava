/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Banner } from '../Banner/Banner.tsx';

import { Card } from './Card.tsx';


type CardArgs = React.ComponentProps<typeof Card>;
type Story = StoryObj<typeof Card>;

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

export default {
  component: Card,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D41%253A4484%26t%3DaJEqUzt6fUeABwmK-1' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    children: <><Card.Heading>Card</Card.Heading>{lorem}</>,
  },
  render: (args) => <Card {...args}/>,
} satisfies Meta<CardArgs>;


export const Standard: Story = {
  decorators: [
    Story => <div style={{ width: '30vw' }}><Story/></div>
  ],
};

/** Multiple cards in a grid. */
export const Multiple: Story = {
  render: (args) => (
    <div style={{
      display: 'grid',
      gap: '1.2rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(30vw, 100%), 1fr))',
    }}>
      <Card {...args}><Card.Heading>Card 1</Card.Heading>Card content.</Card>
      <Card {...args}><Card.Heading>Card 2</Card.Heading>{lorem}</Card>
      <Card {...args}><Card.Heading>Card 3</Card.Heading>Card content.</Card>
    </div>
  ),
  decorators: [
    Story => (
      <div style={{ width: '70vw', display: 'flex', flexFlow: 'column', gap: '1.2rem' }}>
        <Banner variant="info" title="Note:">
          Cards have no margin by default. Use a flex/grid container to space the cards.
        </Banner>
        <Story/>
      </div>
    ),
  ],
};
