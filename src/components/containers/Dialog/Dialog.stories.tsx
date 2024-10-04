/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Dialog } from './Dialog.tsx';


type ButtonArgs = React.ComponentProps<typeof Dialog>;
type Story = StoryObj<ButtonArgs>;

export default {
  component: Dialog,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<ButtonArgs>;


export const Standard: Story = {
  args: {
    children: <>Dialog content</>,
  },
};
