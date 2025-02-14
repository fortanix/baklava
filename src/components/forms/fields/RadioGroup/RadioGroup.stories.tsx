/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { RadioGroup } from './RadioGroup.tsx';


type RadioGroupArgs = React.ComponentProps<typeof RadioGroup>;
type Story = StoryObj<RadioGroupArgs>;

const Color = ['Red', 'Green', 'Blue'] as const;
type Color = (typeof Color)[number];

export default {
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => {
    const [selectedColor, setSelectedColor] = React.useState<Color>(Color[0]);
    // TODO: how to make a typed element? such as <RadioGroup<Color> {...args}>
    return (
      <RadioGroup {...args}
      >
        {Color.map(color =>
          <RadioGroup.RadioField
            key={color}
            label={color}
            checked={color === selectedColor}
            onChange={() => setSelectedColor(color)}
          />
        )}
      </RadioGroup>
    );
  },
} satisfies Meta<RadioGroupArgs>;

export const RadioGroupVertical: Story = {};

export const RadioGroupHorizontal: Story = {
  args: {
    direction: 'horizontal',
  },
};

export const RadioGroupVerticalWithLegend: Story = {
  args: {
    legend: 'Legend',
  },
};

export const RadioGroupHorizontalWithLegend: Story = {
  args: {
    direction: 'horizontal',
    legend: 'Legend',
  },
};
