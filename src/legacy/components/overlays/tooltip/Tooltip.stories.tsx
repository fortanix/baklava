/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './Tooltip.tsx';
import { Button } from '../../buttons/Button.tsx';


type TooltipArgs = React.ComponentProps<typeof Tooltip>;
type Story = StoryObj<TooltipArgs>;

export default {
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover over me</Button>,
  },
  render: (args) => <Tooltip {...args}/>,
} satisfies Meta<TooltipArgs>;


export const TooltipStandard: Story = {};

export const TooltipPositionTop: Story = { args: { placement: 'top' } };
export const TooltipPositionRight: Story = { args: { placement: 'right' } };
export const TooltipPositionBottom: Story = { args: { placement: 'bottom' } };
export const TooltipPositionLeft: Story = { args: { placement: 'left' } };

// FIXME: there is a bug here: the tooltip closes when you click inside it, it should instead stay open
export const TooltipInteractive: Story = {
  args: {
    interactive: true,
    content: <>
      <p>This is an interactive tooltip, it won't go away until you click outside.</p>
      <p>You can interact with the content: <Button>Button</Button></p>
    </>,
  },
};
