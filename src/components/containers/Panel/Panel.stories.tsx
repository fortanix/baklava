/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Alert } from '../Alert/Alert.tsx';

import { Panel } from './Panel.tsx';


type PanelArgs = React.ComponentProps<typeof Panel>;
type Story = StoryObj<typeof Panel>;

export default {
  component: Panel,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D41%253A4484%26t%3DaJEqUzt6fUeABwmK-1' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    children: <Panel.Heading>Panel</Panel.Heading>,
  },
  render: (args) => <Panel {...args}/>,
} satisfies Meta<PanelArgs>;


export const Standard: Story = {};

/** Multiple panels stacked. */
export const Stacked: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: '1.2rem' }}>
      <Alert kind="info">
        Panels have no margin by default. Use a flex/grid container to space the panels.
      </Alert>
      <Panel {...args}><Panel.Heading>Panel 1</Panel.Heading></Panel>
      <Panel {...args}><Panel.Heading>Panel 2</Panel.Heading></Panel>
    </div>
  ),
};
