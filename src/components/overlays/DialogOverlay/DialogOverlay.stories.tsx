/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../ToastProvider/ToastProvider.tsx';
import { DialogModal } from '../DialogModal/DialogModal.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { TooltipProvider } from '../Tooltip/TooltipProvider.tsx';

import { DialogOverlay } from './DialogOverlay.tsx';


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
        trigger={({ activate }) => <Button kind="primary" label="Open overlay" onPress={activate}/>}
      />
      <LoremIpsum paragraphs={3}/>
    </>
  ),
} satisfies Meta<DialogOverlayArgs>;


export const DialogOverlayStandard: Story = {};

export const DialogOverlaySmall: Story = { args: { size: 'small' } };
export const DialogOverlayMedium: Story = { args: { size: 'medium' } };
export const DialogOverlayLarge: Story = { args: { size: 'large' } };

const DialogOverlayControlledWithSubject = (props: React.ComponentProps<typeof DialogOverlay>) => {
  type Subject = { name: string };
  const overlay = DialogOverlay.useOverlayWithSubject<Subject>();
  
  return (
    <article className="bk-prose">
      {overlay.subject &&
        <DialogOverlay {...overlay.props} {...props} title={overlay.subject.name}>
          Details about {overlay.subject.name} here.
        </DialogOverlay>
      }
      
      <p>A single details overlay will be used, filled in with the subject based on which name was pressed.</p>
      
      <p>
        <Button kind="primary" label="Open: Alice" onPress={() => { overlay.activateWith({ name: 'Alice' }); }}/>
      </p>
      <p>
        <Button kind="primary" label="Open: Bob" onPress={() => { overlay.activateWith({ name: 'Bob' }); }}/>
      </p>
    </article>
  );
};
export const DialogModalWithSubject: Story = {
  args: {
    trigger: undefined,
  },
  render: (args) => <DialogOverlayControlledWithSubject {...args}/>,
};

export const DialogOverlayWithNestedModal: Story = {
  args: {
    display: 'slide-over',
    popoverBehavior:'manual',
    children: (
      <DialogModal
        title="Modal"
        trigger={({ activate }) => <Button kind="primary" label="Open modal" onPress={activate}/>}
      >
        Modal nested inside a popover.
      </DialogModal>
    ),
  },
};

export const DialogOverlayWithTooltip: Story = {
  args: {
    display: 'slide-over',
    children: (
      <TooltipProvider tooltip="Test">
        <Button>Hover over me</Button>
      </TooltipProvider>
    ),
  },
};

export const DialogOverlayWithToast: Story = {
  args: {
    display: 'slide-over',
    children: (
      <Button kind="primary" label="Trigger notification"
        onPress={() => notify.info('This notification should be above the overlay.', { autoClose: false })}
      />
    ),
  },
};
