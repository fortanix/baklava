/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';

import { CardKey, SegmentedCardActionControl } from './SegmentedCardActionControl.tsx';

type SegmentedCardActionControlArgs = React.ComponentProps<typeof SegmentedCardActionControl>;
type Story = StoryObj<SegmentedCardActionControlArgs>;

export default {
  component: SegmentedCardActionControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Choose a color',
    onUpdate: selected => { console.log('update', selected); },
    defaultSelected: 'eks',
    children: (
      <>
        <SegmentedCardActionControl.Card
          key="eks"
          icon="account"
          cardKey="eks"
          title="External Key Source Connection"
        />
        <SegmentedCardActionControl.Card key="aws" icon="account" cardKey="aws" title="Amazon Web Services" />
        <SegmentedCardActionControl.Card key="azure" icon="account" cardKey="azure" title="Azure" />
      </>
    ),
  },
  render: (args) => <SegmentedCardActionControl {...args} />,
} satisfies Meta<SegmentedCardActionControlArgs>;


export const SegmentedCardActionControlStandard: Story = {};


export const SegmentedCardActionControlHover: Story = {
  args: {
    children: (
      <>
        <SegmentedCardActionControl.Card icon="account" cardKey="red" title="Red" />
        <SegmentedCardActionControl.Card
          icon="account"
          cardKey="green"
          title="Green (Hovered)"
          className="pseudo-hover"
        />
        <SegmentedCardActionControl.Card icon="account" cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const SegmentedCardActionControlFocused: Story = {
  args: {
    children: (
      <>
        <SegmentedCardActionControl.Card
          icon="account"
          cardKey="red"
          title="Red (Focused)"
          className="pseudo-focus-visible"
        />
        <SegmentedCardActionControl.Card icon="account" cardKey="green" title="Green" />
        <SegmentedCardActionControl.Card icon="account" cardKey="blue" title="Blue" />
      </>
    ),
  },
};


type SegmentedCardActionControlControlledProps = Omit<React.ComponentProps<typeof SegmentedCardActionControl>, 'selected'>;
const SegmentedCardActionControlControlledC = (props: SegmentedCardActionControlControlledProps) => {
  const [selectedButton, setSelectedButton] = React.useState<undefined | CardKey>(props.defaultSelected ?? undefined);

  return (
    <>
      <p>Selected color: {selectedButton ?? <em>none</em>}</p>
      <SegmentedCardActionControl {...props} selected={selectedButton} onUpdate={setSelectedButton} />
      <Button label="Update state" onPress={() => { setSelectedButton('blue'); }} />
    </>
  );
};

export const SegmentedCardActionControlControlled: Story = {
  render: args => <SegmentedCardActionControlControlledC {...args} />,
  args: {
    children: (
      <>
        <SegmentedCardActionControl.Card icon="account" cardKey="red" title="Red" />
        <SegmentedCardActionControl.Card icon="account" cardKey="green" title="Green" />
        <SegmentedCardActionControl.Card icon="account" cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const SegmentedCardActionControlControlledWithDefault: Story = {
  render: args => <SegmentedCardActionControlControlledC {...args} defaultSelected="green" />,
  args: {
    children: (
      <>
        <SegmentedCardActionControl.Card icon="account" cardKey="red" title="Red" />
        <SegmentedCardActionControl.Card icon="account" cardKey="green" title="Green" />
        <SegmentedCardActionControl.Card icon="account" cardKey="blue" title="Blue" />
      </>
    ),
  },
};
