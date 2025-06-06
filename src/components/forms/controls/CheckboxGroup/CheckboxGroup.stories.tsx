/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { CheckboxGroup } from './CheckboxGroup.tsx';


type CheckboxGroupArgs = React.ComponentProps<typeof CheckboxGroup>;
type Story = StoryObj<CheckboxGroupArgs>;

export default {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Choose some colors',
    children: (
      <>
        <CheckboxGroup.Checkbox checkboxKey="red" label="Red" defaultChecked/>
        <CheckboxGroup.Checkbox checkboxKey="green" label="Green" defaultChecked/>
        <CheckboxGroup.Checkbox checkboxKey="blue" label="Blue"/>
      </>
    ),
  },
} satisfies Meta<CheckboxGroupArgs>;

export const CheckboxGroupHorizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const CheckboxGroupVertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const CheckboxGroupDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const CheckboxGroupWithDisabled: Story = {
  args: {
    children: (
      <>
        <CheckboxGroup.Checkbox checkboxKey="red" label="Red" defaultChecked/>
        <CheckboxGroup.Checkbox checkboxKey="green" label="Green" defaultChecked disabled/>
        <CheckboxGroup.Checkbox checkboxKey="blue" label="Blue"/>
      </>
    ),
  },
};

const CheckboxGroupControlledC = () => {
  const Color = ['red', 'green', 'blue'];
  type Color = (typeof Color)[number];
  
  const [selectedColors, setSelectedColors] = React.useState<Set<Color>>(new Set(['red', 'blue']));
  return (
    <CheckboxGroup
      name="story-checkbox-group"
      label={`Choose some colors (selected: ${[...selectedColors].join(', ') || 'none'})`}
      selected={selectedColors}
      onUpdate={checkboxKeys => { setSelectedColors(checkboxKeys as Set<Color>); }}
      style={{ minWidth: 320 }}
    >
      <CheckboxGroup.Checkbox checkboxKey="red" label="Red"/>
      <CheckboxGroup.Checkbox checkboxKey="green" label="Green"/>
      <CheckboxGroup.Checkbox checkboxKey="blue" label="Blue"/>
    </CheckboxGroup>
  );
};
export const CheckboxGroupControlled: Story = {
  render: args => <CheckboxGroupControlledC {...args}/>,
  args: {
  },
};

/**
 * A checkbox group can be used within a `<form>` element, either by nesting or explicitly specifying the form ID
 * through the `form` prop.
 */
export const CheckboxGroupInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            const selectedColors = new FormData(event.currentTarget).getAll('controlledCheckboxes[]');
            notify.info(`You have chosen: ${[...selectedColors].join(', ') || 'none'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'controlledCheckboxes[]',
  },
};
