/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { RadioGroup } from './RadioGroup.tsx';


type RadioGroupArgs = React.ComponentProps<typeof RadioGroup>;
type Story = StoryObj<RadioGroupArgs>;

const RadioGroupUnique = (args: RadioGroupArgs) => {
  // Note: make the name unique per story so we don't get conflicts on the Docs page
  const id = React.useId();
  return <RadioGroup {...args} name={args.name ?? id}/>;
};

export default {
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Choose a color',
    defaultSelected: 'red',
    children: (
      <>
        <RadioGroup.Button radioKey="red" label="Red"/>
        <RadioGroup.Button radioKey="green" label="Green"/>
        <RadioGroup.Button radioKey="blue" label="Blue"/>
      </>
    ),
  },
  render: args => <RadioGroupUnique {...args}/>,
} satisfies Meta<RadioGroupArgs>;

export const RadioGroupStandard: Story = {};

export const RadioGroupWithWrap: Story = {
  args: {
    style: { overflow: 'hidden', resize: 'horizontal', width: 180 },
  },
};

export const RadioGroupVertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const RadioGroupVerticalWithWrap: Story = {
  args: {
    style: { overflow: 'hidden', resize: 'vertical', width: 220, height: 100 },
    orientation: 'vertical',
  },
};

export const RadioGroupDisabled: Story = {
  args: {
    disabled: true,
  },
};

const RadioGroupControlledC = () => {
  const Color = ['red', 'green', 'blue'];
  type Color = (typeof Color)[number];
  
  const [selectedColor, setSelectedColor] = React.useState<Color>('red');
  return (
    <RadioGroup
      name="story_radio_group"
      label={`Choose a color (selected: ${selectedColor})`}
      selected={selectedColor}
      onUpdate={radioKey => { setSelectedColor(radioKey as Color); }}
    >
      <RadioGroup.Button radioKey="red" label="Red"/>
      <RadioGroup.Button radioKey="green" label="Green"/>
      <RadioGroup.Button radioKey="blue" label="Blue"/>
    </RadioGroup>
  );
};
export const RadioGroupControlled: Story = {
  render: args => <RadioGroupControlledC {...args}/>,
  args: {
  },
};

/**
 * A radio group can be used within a `<form>` element, either by nesting or explicitly specifying the form ID through
 * the `form` prop.
 */
export const RadioGroupInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            console.log('x', [...new FormData(event.currentTarget).keys()]);
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('controlled_radio') ?? 'unknown'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'controlled_radio',
  },
};
