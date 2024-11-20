/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { H4 } from '../../../typography/Heading/Heading.tsx';
import { Alert } from './Alert.tsx';


type AlertArgs = React.ComponentProps<typeof Alert>;
type Story = StoryObj<typeof Alert>;

export default {
  component: Alert,
  parameters: {
    layout: 'padded',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    children: <H4>Alert</H4>,
  },
  render: (args) => <Alert {...args}/>,
} satisfies Meta<AlertArgs>;


export const Standard: Story = {};

export const InfoAlert: Story = { args: { kind: 'info' } };
export const WarningAlert: Story = { args: { kind: 'warning' } };
export const ErrorAlert: Story = { args: { kind: 'error' } };
export const SuccessAlert: Story = { args: { kind: 'success' } };

/** Multiple alerts stacked. */
export const Stacked: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: '1.2rem' }}>
      <Alert {...args} kind="success"><H4>Alert 1</H4></Alert>
      <Alert {...args} kind="error"><H4>Alert 2</H4></Alert>
    </div>
  ),
};
