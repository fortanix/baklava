/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { RadioButtonGroup } from './RadioButtonGroup.tsx';


type RadioButtonGroupArgs = React.ComponentProps<typeof RadioButtonGroup>;
type Story = StoryObj<RadioButtonGroupArgs>;

const Color = ['Red', 'Green', 'Blue'] as const;
type Color = (typeof Color)[number];

export default {
  component: RadioButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => {
    const [selectedColor, setSelectedColor] = React.useState<Color>(Color[0]);
    // TODO: how to make a typed element? such as <RadioButtonGroup<Color> {...args}>
    return (
      <RadioButtonGroup {...args}
      >
        {Color.map(color =>
          <RadioButtonGroup.RadioButtonField
            key={color}
            label={color}
            checked={color === selectedColor}
            onChange={() => setSelectedColor(color)}
          />
        )}
      </RadioButtonGroup>
    );
  },
} satisfies Meta<RadioButtonGroupArgs>;

export const RadioButtonGroupVertical: Story = {};

export const RadioButtonGroupHorizontal: Story = {
  args: {
    direction: 'horizontal',
  },
};
