/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from '../Dialog/Dialog';
import { Logo } from '../../../layouts/AppLayout/Logo/Logo.tsx';

import { DialogLayout } from './DialogLayout';

type DialogLayoutArgs = React.ComponentProps<typeof DialogLayout>;
type Story = StoryObj<DialogLayoutArgs>;

export default {
  tags: ['autodocs'],
  component: DialogLayout,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<DialogLayoutArgs>;


export const DialogPattern2: Story = {
  render: () => {
    return (
      <Dialog
        title={<Logo subtitle="Armor"/>}
        showCancelAction={false}
      >
        <DialogLayout
          title="Let's Connect to Your Cloud Provider"
          aside={<>Lorem ipsum</>}
        >
          Hello World
        </DialogLayout>
      </Dialog>
    );
  },
};
