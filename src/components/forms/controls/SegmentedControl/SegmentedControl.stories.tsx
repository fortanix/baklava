/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';

import { type ButtonKey, SegmentedControl } from './SegmentedControl.tsx';


type SegmentedControlArgs = React.ComponentProps<typeof SegmentedControl>;
type Story = StoryObj<SegmentedControlArgs>;

export default {
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    'aria-label': 'Choose a color',
    onUpdate: selected => { console.log('update', selected); },
    defaultSelected: 'red',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
  render: (args) => <SegmentedControl {...args}/>,
} satisfies Meta<SegmentedControlArgs>;


export const SegmentedControlStandard: Story = {};

export const SegmentedControlWithIcon: Story = {
  args: {
    defaultSelected: 'edit',
    children: (
      <>
        <SegmentedControl.Button buttonKey="edit" icon="edit" label="Edit"/>
        <SegmentedControl.Button buttonKey="delete" icon="delete" label="Delete"/>
      </>
    ),
  },
};

export const SegmentedControlWithIconOnly: Story = {
  args: {
    defaultSelected: 'edit',
    children: (
      <>
        <SegmentedControl.Button buttonKey="edit" icon="edit"/>
        <SegmentedControl.Button buttonKey="delete" icon="delete"/>
      </>
    ),
  },
};

export const SegmentedControlHover: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" className="pseudo-hover"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlFocused: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red" className="pseudo-focus-visible"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const SegmentedControlDisabledOne: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" disabled/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

type SegmentedControlControlledProps = Omit<React.ComponentProps<typeof SegmentedControl>, 'selected'>;
const SegmentedControlControlledC = (props: SegmentedControlControlledProps) => {
  const [selectedButton, setSelectedButton] = React.useState<undefined | ButtonKey>(props.defaultSelected ?? undefined);
  
  return (
    <>
      <p>Selected color: {selectedButton ?? <em>none</em>}</p>
      <SegmentedControl {...props} selected={selectedButton} onUpdate={setSelectedButton}/>
      <Button label="Update state" onPress={() => { setSelectedButton('blue'); }}/>
    </>
  );
};

export const SegmentedControlControlled: Story = {
  render: args => <SegmentedControlControlledC {...args}/>,
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlControlledWithDefault: Story = {
  render: args => <SegmentedControlControlledC {...args} defaultSelected="green"/>,
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};
