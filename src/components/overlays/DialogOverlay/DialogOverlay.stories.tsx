/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../ToastProvider/ToastProvider.tsx';
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
    display: 'slide-over',
    title: 'Title',
    children: 'Content',
  },
  render: (args) => (
    <>
      <LoremIpsum paragraphs={3}/>
      <DialogOverlay {...args}
        trigger={({ activate }) => <Button variant="primary" label="Open overlay" onPress={activate}/>}
      />
      <LoremIpsum paragraphs={3}/>
    </>
  ),
} satisfies Meta<DialogOverlayArgs>;


export const DialogOverlayStandard: Story = {};

export const DialogOverlaySmall: Story = { args: { size: 'small' } };
export const DialogOverlayMedium: Story = { args: { size: 'medium' } };
export const DialogOverlayLarge: Story = { args: { size: 'large' } };

export const DialogOverlayWithNestedModal: Story = {
  args: {
    display: 'slide-over',
    children: (
      <DialogModal
        title="Modal"
        trigger={({ activate }) => <Button variant="primary" label="Open modal" onPress={activate}/>}
      >
        Modal nested inside a popover.
      </DialogModal>
    ),
  },
};

export const DialogOverlayWithToast: Story = {
  args: {
    display: 'slide-over',
    children: (
      <Button variant="primary" label="Trigger notification"
        onPress={() => notify.info('This notification should be above the overlay.', { autoClose: false })}
      />
    ),
  },
};
