/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../actions/Button/Button.tsx';

import { DialogModal } from './DialogModal.tsx';


type DialogModalArgs = React.ComponentProps<typeof DialogModal>;
type Story = StoryObj<DialogModalArgs>;

export default {
  component: DialogModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    title: 'Modal dialog',
    trigger: ({ active, activate }) => <Button variant="primary" label="Open modal" onPress={activate}/>,
    children: <LoremIpsum paragraphs={15}/>,
  },
  render: (args) => <><LoremIpsum paragraphs={2}/> <DialogModal {...args}/> <LoremIpsum paragraphs={2}/></>,
} satisfies Meta<DialogModalArgs>;


export const DialogModalStandard: Story = {};

export const DialogModalSmall: Story = {
  args: {
    size: 'small',
  },
};

export const DialogModalLarge: Story = {
  args: {
    size: 'large',
  },
};

export const DialogModalFullScreen: Story = {
  args: {
    display: 'full-screen',
    title: 'Full screen modal dialog',
  },
};

export const DialogModalSlideOver: Story = {
  args: {
    display: 'slide-over',
    title: 'Slide over modal dialog',
  },
};

const DialogModalAutoOpen = (props: React.ComponentProps<typeof DialogModal>) => {
  const ref = DialogModal.useModalRef(null);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: want to only trigger this once
    React.useEffect(() => {
    globalThis.setTimeout(() => {
      ref.current?.activate();
    }, 2000);
  }, []);
  
  return <DialogModal modalRef={ref} {...props}/>;
};
export const DialogModalWithRef: Story = {
  args: {
    trigger: undefined,
    children: 'This modal was automatically opened through a ref.',
  },
  render: (args) => (
    <>
      A modal will automatically open after 2 seconds.
      <DialogModalAutoOpen {...args}/>
    </>
  ),
};

export const ConfirmationDialog: Story = {
  args: {
    trigger: ({ active, activate }) => <Button variant="primary" label="Delete" onPress={activate}/>,
    display: 'center',
    size: 'small',
    title: 'Confirmation',
    children: <>Are you sure you want to delete this item?</>,
    actions: <DialogModal.SubmitAction label="Delete" onPress={() => { window.alert('Confirmed'); }}/>,
  },
};
