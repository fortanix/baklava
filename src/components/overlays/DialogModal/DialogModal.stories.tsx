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
    trigger: ({ activate }) => <Button variant="primary" label="Open modal" onPress={activate}/>,
    children: <LoremIpsum paragraphs={15}/>,
  },
  render: (args) => <><LoremIpsum paragraphs={2}/> <DialogModal {...args}/> <LoremIpsum paragraphs={2}/></>,
} satisfies Meta<DialogModalArgs>;


export const DialogModalStandard: Story = {};

export const DialogModalNoncloseable: Story = {
  args: {
    activeDefault: true,
    allowUserClose: false,
    children: ({ close }) => (
      <article className="bk-body-text">
        <p>It should not be possible to close this dialog, except through the following button:</p>
        <p><Button variant="primary" label="Force close" onPress={close}/></p>
      </article>
    ),
  },
};

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

const DialogModalControlledWithRef = (props: React.ComponentProps<typeof DialogModal>) => {
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
      <DialogModalControlledWithRef {...args}/>
    </>
  ),
};

const DialogModalControlledWithSubject = (props: React.ComponentProps<typeof DialogModal>) => {
  type Subject = { name: string };
  const modal = DialogModal.useModalWithSubject<null | Subject>(null);
  
  return (
    <article className="bk-body-text">
      {modal.subject &&
        <DialogModal {...modal.props} {...props} title={modal.subject.name}>
          Details about {modal.subject.name} here.
        </DialogModal>
      }
      
      <p>A single details modal will be used, filled in with the subject based on which name was pressed.</p>
      
      <p><Button variant="primary" label="Open: Alice" onPress={() => { modal.activateWith({ name: 'Alice' }); }}/></p>
      <p><Button variant="primary" label="Open: Bob" onPress={() => { modal.activateWith({ name: 'Bob' }); }}/></p>
    </article>
  );
};
export const DialogModalWithSubject: Story = {
  args: {
    trigger: undefined,
  },
  render: (args) => <DialogModalControlledWithSubject {...args}/>,
};

const DialogModalControlledConfirmation = (props: React.ComponentProps<typeof DialogModal>) => {
  type Subject = { name: string };
  const deleteConfirmer = DialogModal.useConfirmationModal<null | Subject>(null, {
    onConfirm() { globalThis.alert('Confirmed'); },
    onCancel() { globalThis.alert('Canceled'); },
  });
  
  return (
    <article className="bk-body-text">
      {deleteConfirmer.subject &&
        <DialogModal {...deleteConfirmer.props} {...props} title={deleteConfirmer.subject.name}>
          Are you sure you want to delete "{deleteConfirmer.subject.name}"?
        </DialogModal>
      }
      
      <p>A single details modal will be used, filled in with the subject based on which name was pressed.</p>
      
      <p>
        <Button variant="primary" label="Delete Item 1"
          onPress={() => { deleteConfirmer.activateWith({ name: 'Item 1' }); }}
        />
      </p>
      <p>
        <Button variant="primary" label="Delete Item 2"
          onPress={() => { deleteConfirmer.activateWith({ name: 'Item 2' }); }}
        />
      </p>
    </article>
  );
};
export const DialogModalConfirmation: Story = {
  args: {
    trigger: undefined,
  },
  render: (args) => <DialogModalControlledConfirmation {...args}/>,
};
