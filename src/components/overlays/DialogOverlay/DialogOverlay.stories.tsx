/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { DialogOverlay } from './DialogOverlay.tsx';
import { DialogModal } from '../DialogModal/DialogModal.tsx';
import { Button } from '../../actions/Button/Button.tsx';


type DialogOverlayArgs = React.ComponentProps<typeof DialogOverlay>;
type Story = StoryObj<DialogOverlayArgs>;

export default {
  component: DialogOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    title: 'Title',
    children:           <DialogModal
    title="Modal"
    trigger={({ activate }) => <Button label="Open modal" onPress={activate}/>}
  >
    Test
  </DialogModal>,
  },
  render: (args) => <><LoremIpsum paragraphs={5}/><DialogOverlay {...args}/></>,
} satisfies Meta<DialogOverlayArgs>;


export const DialogOverlayStandard: Story = {};

export const DialogOverlayWithVariant: Story = {
  args: {
  },
};
