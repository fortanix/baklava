/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { RadioGroup } from './RadioGroup.tsx';


type RadioGroupArgs = React.ComponentProps<typeof RadioGroup>;
type Story = StoryObj<RadioGroupArgs>;

export default {
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    name: 'color',
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
  render: args => <RadioGroup {...args}/>,
} satisfies Meta<RadioGroupArgs>;

export const RadioGroupStandard: Story = {};

export const RadioGroupWithWrap: Story = {
  decorators: [Story => <div style={{ display: 'flex', width: 200 }}><Story/></div>],
};

export const RadioGroupVertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const RadioGroupVerticalWithWrap: Story = {
  decorators: [Story => <div style={{ display: 'flex', width: 400, height: '4lh' }}><Story/></div>],
  args: {
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
      name="story-radio-group"
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
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story-radio') ?? 'unknown'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'story-radio',
  },
};
