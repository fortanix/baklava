/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../Button/Button.tsx';

import { type ButtonKey, SegmentedControl } from './SegmentedControl.tsx';


type SegmentedControlArgs = React.ComponentProps<typeof SegmentedControl>;
type Story = StoryObj<SegmentedControlArgs>;

export default {
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    size: 'small',
    'aria-label': 'Choose a color',
    onUpdate: selected => { console.log('Update:', selected); },
    selectedDefault: 'red',
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


export const SegmentedControlStandard: Story = {
  args: {
    'aria-label': 'Color',
    selectedDefault: 'blue',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlWithIcon: Story = {
  args: {
    selectedDefault: 'edit',
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
    selectedDefault: 'edit',
    children: (
      <>
        <SegmentedControl.Button buttonKey="edit" aria-label="edit" icon="edit"/>
        <SegmentedControl.Button buttonKey="delete" aria-label="delete" icon="delete"/>
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

export const SegmentedControlNonactive: Story = {
  args: {
    nonactive: true,
  },
};
export const SegmentedControlNonactiveOne: Story = {
  args: {
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green" nonactive/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
  },
};

export const SegmentedControlVerticalWritingMode: Story = {
  args: {
    style: { writingMode: 'vertical-rl', fontSize: '1.4em' },
    'aria-orientation': 'vertical',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="赤"/>
        <SegmentedControl.Button buttonKey="green" label="緑"/>
        <SegmentedControl.Button buttonKey="blue" label="青"/>
      </>
    ),
  },
};

export const SegmentedControlUncontrolled: Story = {
  args: {
    'aria-label': 'Color',
    selectedDefault: 'blue',
    children: (
      <>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </>
    ),
    onUpdateSelected: selected => { notify.info(`Uncontrolled state was changed: ${selected ?? '(none)'}`); },
  },
};

type SegmentedControlControlledProps = Omit<React.ComponentProps<typeof SegmentedControl>, 'selected'>;
const SegmentedControlControlledC = ({ selectedDefault, ...props }: SegmentedControlControlledProps) => {
  const [selectedButton, setSelectedButton] = React.useState<undefined | null | ButtonKey>(selectedDefault);
  
  return (
    <>
      <p>Selected color: {selectedButton ?? <em>none</em>}</p>
      <SegmentedControl {...props} selected={selectedButton} onUpdateSelected={setSelectedButton}>
        <SegmentedControl.Button buttonKey="red" label="Red"/>
        <SegmentedControl.Button buttonKey="green" label="Green"/>
        <SegmentedControl.Button buttonKey="blue" label="Blue"/>
      </SegmentedControl>
      <Button label="Update state" onPress={() => { setSelectedButton('blue'); }}/>
    </>
  );
};

export const SegmentedControlControlled: Story = {
  render: args => <SegmentedControlControlledC {...args}/>,
  args: {
    // Don't define `children` here, we want to have them dynamically recreated on render, in order to verify rerender
    // behavior. Selecting an item should cause `children` to be recreated, but the items should not rerender unless
    // they were affected by the state change (i.e. only the unselected and newly selected items should rerender).
    //children: undefined,
    selectedDefault: 'green',
  },
};

export const SegmentedControlControlledWithEmptyDefault: Story = {
  render: args => <SegmentedControlControlledC {...args}/>,
  args: {
    selectedDefault: undefined,
  },
};
