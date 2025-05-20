/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';
import { DummyBkLinkWithNotify } from '../../../util/storybook/StorybookLink.tsx';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import type { Meta, StoryObj } from '@storybook/react';

import { Banner } from '../Banner/Banner.tsx';

import { Card } from './Card.tsx';


type CardArgs = React.ComponentProps<typeof Card>;
type Story = StoryObj<typeof Card>;

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
    children: <LoremIpsum/>,
  },
  render: (args) => <Card {...args}/>,
} satisfies Meta<CardArgs>;


export const CardStandard: Story = {
  decorators: [Story => <LayoutDecorator size="small"><Story/></LayoutDecorator>],
};

export const CardWithHeading: Story = {
  decorators: [Story => <LayoutDecorator size="small"><Story/></LayoutDecorator>],
  args: {
    children: (
      <>
        <Card.Heading>Heading</Card.Heading>
        <LoremIpsum/>
      </>
    ),
  },
};

export const CardWithHeadingLink: Story = {
  decorators: [Story => <LayoutDecorator size="small"><Story/></LayoutDecorator>],
  args: {
    children: (
      <>
        <Card.HeadingLink Link={DummyBkLinkWithNotify}>A heading that acts as a link</Card.HeadingLink>
        <LoremIpsum/>
      </>
    ),
  },
};

/** Multiple cards in a grid. */
export const CardGrid: Story = {
  decorators: [
    Story => (
      <LayoutDecorator size="x-large" style={{ display: 'flex', flexFlow: 'column', gap: '1.2rem' }}>
        <Banner variant="info" title="Note:">
          Cards have no margin by default. Use a flex/grid container to space the cards.
        </Banner>
        <Story/>
      </LayoutDecorator>
    ),
  ],
  render: (args) => (
    <div style={{
      display: 'grid',
      gap: '1.2rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(30vw, 100%), 1fr))',
    }}>
      <Card {...args}><Card.Heading>Card 1</Card.Heading>Card content.</Card>
      <Card {...args}><Card.Heading>Card 2</Card.Heading><LoremIpsum/></Card>
      <Card {...args}><Card.Heading>Card 3</Card.Heading>Card content.</Card>
    </div>
  ),
};

export const CardNested: Story = {
  decorators: [Story => <LayoutDecorator size="small"><Story/></LayoutDecorator>],
  args: {
    children: (
      <>
        <Card.Heading>A parent card</Card.Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <Card unstyled>
            <Card.Heading>A nested card</Card.Heading>
            Content
          </Card>
          <Card unstyled>
            <Card.Heading>Another nested card</Card.Heading>
            Content
          </Card>
        </div>
      </>
    ),
  },
};
