/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../ToastProvider/ToastProvider.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { AccountSelector } from '../../../layouts/AppLayout/Header/AccountSelector.tsx';

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
    title: 'Modal Dialog',
    trigger: ({ activate }) => <Button kind="primary" label="Open modal" onPress={activate}/>,
    children: <LoremIpsum paragraphs={15}/>,
  },
  render: (args) => <><LoremIpsum paragraphs={2}/> <DialogModal {...args}/> <LoremIpsum paragraphs={2}/></>,
} satisfies Meta<DialogModalArgs>;


let count = 1;
const notifyTest = () => {
  notify({
    // biome-ignore lint/style/noNonNullAssertion: Will not be undefined.
    variant: (['success', 'info', 'error', 'warning'] as const)[count % 4]!,
    title: `Test ${count++}`,
    message: 'Test notification',
  });
};

export const DialogModalStandard: Story = {};

export const DialogModalSmall: Story = {
  args: { size: 'small' },
};

export const DialogModalLarge: Story = {
  args: { size: 'large' },
};

export const DialogModalFullScreen: Story = {
  args: {
    display: 'full-screen',
    title: 'Full screen modal dialog',
  },
};

export const DialogModalSlideOverRight: Story = {
  args: {
    display: 'slide-over',
    size: 'large',
    slideOverPosition: 'right',
    title: 'Slide over modal dialog',
  },
};
export const DialogModalSlideOverLeft: Story = {
  args: {
    display: 'slide-over',
    size: 'medium',
    slideOverPosition: 'left',
    title: 'Slide over modal dialog',
  },
};

export const DialogModalNested: Story = {
  args: {
    title: 'Modal with a submodal',
    className: 'outer',
    children: (
      <DialogModal
        className="inner"
        title="Submodal"
        trigger={({ activate }) => <Button kind="primary" label="Open submodal" onPress={activate}/>}
      >
        This is a submodal. Closing this modal should keep the outer modal still open.
      </DialogModal>
    ),
  },
};

export const DialogModalWithToast: Story = {
  args: {
    title: 'Modal with a submodal',
    className: 'outer',
    children: (
      <>
        <Button kind="primary" onPress={() => { notifyTest(); }}>
          Trigger toast notification
        </Button>
        <DialogModal
          className="inner"
          title="Submodal"
          trigger={({ activate }) => <Button kind="primary" label="Open submodal" onPress={activate}/>}
        >
          <p>Test rendering toast notifications over the modal:</p>
          <Button kind="primary" onPress={() => { notifyTest(); }}>
            Trigger toast notification
          </Button>
        </DialogModal>
      </>
    ),
  },
};

/**
 * Same as the prior story, but where the modals are immediately unmounted, preventing exit animations as well as
 * the exit `onToggle` event listener. We need to take care that toast notifications do not break in this case.
 */
const DialogModalWithToastUnmountC = (props: React.ComponentProps<typeof DialogModal>) => {
  const [mounted, setMounted] = React.useState(true);
  
  // Simulate a sudden unmount of the entire `DialogModal`
  if (!mounted) { return null; }
  
  return (
    <DialogModal {...props}>
      <Button kind="primary" onPress={() => { notifyTest(); }}>
        Trigger toast notification
      </Button>
      <DialogModal
        className="inner"
        title="Submodal"
        trigger={({ activate }) => <Button kind="primary" label="Open submodal" onPress={activate}/>}
        onClose={() => { setMounted(false); }}
      >
        <p>Test rendering toast notifications over the modal:</p>
        <Button kind="primary" onPress={() => { notifyTest(); }}>
          Trigger toast notification
        </Button>
      </DialogModal>
    </DialogModal>
  );
};
export const DialogModalWithToastUnmount: Story = {
  render: args => <DialogModalWithToastUnmountC {...args}/>,
  args: {
    title: 'Modal with a submodal',
    className: 'outer',
  },
};

export const DialogModalWithDropdown: Story = {
  args: {
    title: 'Modal with a dropdown',
    children: (
      <>
        <p>The following dropdown menu should overlay the modal (and not be cut off).</p>
        <AccountSelector
          className="select-action"
          accounts={
            <>
              {Array.from({ length: 30 }, (_, index) => `Account ${index + 1}`).map(name =>
                <AccountSelector.Option key={`acc_${name}`} itemKey={`acc_${name}`} icon="account" label={name}/>
              )}
              <AccountSelector.FooterActions>
                <AccountSelector.Action itemKey="action_add-account" label="Add account" onActivate={() => {}}/>
              </AccountSelector.FooterActions>
            </>
          }
        >
          {selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label.replace(/^acc_/, '')}
        </AccountSelector>
      </>
    ),
  },
};

export const DialogModalUncloseable: Story = {
  args: {
    activeDefault: true,
    allowUserClose: false,
    children: ({ close }) => (
      <article className="bk-prose">
        <p>It should not be possible to close this dialog, except through the following button:</p>
        <p><Button kind="primary" label="Force close" onPress={close}/></p>
      </article>
    ),
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
  const modal = DialogModal.useModalWithSubject<Subject>();
  
  return (
    <article className="bk-prose">
      {modal.subject &&
        <DialogModal {...modal.props} {...props} title={modal.subject.name}>
          Details about {modal.subject.name} here.
        </DialogModal>
      }
      
      <p>A single details modal will be used, filled in with the subject based on which name was pressed.</p>
      
      <p><Button kind="primary" label="Open: Alice" onPress={() => { modal.activateWith({ name: 'Alice' }); }}/></p>
      <p><Button kind="primary" label="Open: Bob" onPress={() => { modal.activateWith({ name: 'Bob' }); }}/></p>
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
  const [deleted, setDeleted] = React.useState(new Set());
  const deleteConfirmer = DialogModal.useConfirmationModal<Subject>({
    actionLabel: 'Delete',
    onConfirm(subject) { setDeleted(deleted => new Set([...deleted, subject.name])); },
    onCancel(subject) { console.log(`Canceled deleting ${subject.name}`); },
  });
  
  return (
    <article className="bk-prose">
      {deleteConfirmer.subject &&
        <DialogModal {...deleteConfirmer.props} {...props} title="Confirm Delete">
          Are you sure you want to delete "{deleteConfirmer.subject.name}"?
        </DialogModal>
      }
      
      <p>A single details modal will be used, filled in with the subject based on which name was pressed.</p>
      
      <p>
        <Button kind="primary"
          label={deleted.has('Item 1') ? 'Deleted' : `Delete Item 1`}
          disabled={deleted.has('Item 1')}
          onPress={() => { deleteConfirmer.activateWith({ name: 'Item 1' }); }}
        />
      </p>
      <p>
        <Button kind="primary"
          label={deleted.has('Item 2') ? 'Deleted' : `Delete Item 2`}
          disabled={deleted.has('Item 2')}
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
