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
    label: 'Choose a color:',
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

export const RadioGroupWithHorizontalLabel: Story = {
  args: {
    labelOrientation: 'horizontal',
  },
};

export const RadioGroupWithWrap: Story = {
  args: {
    style: { overflow: 'hidden', resize: 'horizontal', inlineSize: 180 },
  },
};

export const RadioGroupVertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const RadioGroupVerticalWithHorizontalLabel: Story = {
  args: {
    orientation: 'vertical',
    labelOrientation: 'horizontal',
  },
};

export const RadioGroupVerticalWithWrap: Story = {
  args: {
    style: { overflow: 'hidden', resize: 'vertical', padding: 5, inlineSize: 220, blockSize: 100 },
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
      name="storyRadioGroup"
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
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('controlledRadio') ?? 'unknown'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'controlledRadio',
  },
};

export const RadioGroupDirectionRtl: Story = {
  args: {
    style: { overflow: 'hidden', resize: 'horizontal', padding: 5, inlineSize: 220, blockSize: 140, direction: 'rtl' },
    label: 'اختر اللون',
    children: (
      <>
        <RadioGroup.Button radioKey="red" label="أحمر"/>
        <RadioGroup.Button radioKey="green" label="أخضر"/>
        <RadioGroup.Button radioKey="blue" label="أزرق"/>
      </>
    ),
  },
};

export const RadioGroupWritingModeVertical: Story = {
  args: {
    style: {
      overflow: 'hidden',
      resize: 'vertical',
      padding: 5,
      inlineSize: 220,
      blockSize: 140,
      writingMode: 'vertical-rl',
    },
    label: '色を選択してください',
    children: (
      <>
        <RadioGroup.Button radioKey="red" label="赤"/>
        <RadioGroup.Button radioKey="green" label="緑"/>
        <RadioGroup.Button radioKey="blue" label="青"/>
      </>
    ),
  },
};
