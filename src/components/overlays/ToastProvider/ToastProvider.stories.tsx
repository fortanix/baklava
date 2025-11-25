/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../util/reactUtil.ts';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../actions/Button/Button.tsx';

import { type ToastDescriptor, ToastProvider, notify } from './ToastProvider.tsx';


type ToastProviderArgs = React.ComponentProps<typeof ToastProvider>;
type Story = StoryObj<ToastProviderArgs>;

export default {
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <ToastProvider {...args}/>,
} satisfies Meta<ToastProviderArgs>;


const ToastAutomatic = (props: Partial<ToastDescriptor>) => {
  useEffectOnce(() => {
    notify({
      variant: 'info',
      title: 'Notification title',
      message: 'This is a notification.',
      ...props,
      options: { autoClose: false, ...(props.options ?? {}) },
    });
  });
  
  return null;
};

export const ToastStandard: Story = {
  args: {
    children: <><ToastAutomatic/><p className="bk-prose">A notification should appear on screen.</p></>,
  },
};

export const ToastProviderWithTrigger: Story = {
  args: {
    children: (
      <Button kind="primary" label="Notify (success)"
        onPress={() => {
          notify.success({ title: 'Notification title', message: 'This is a success notification.' });
        }}
      />
    ),
  },
};

export const ToastVariantInfo: Story = {
  args: {
    children: (
      <>
        <ToastAutomatic variant="info"/>
        <p className="bk-prose">A notification should appear on screen.</p>
      </>
    ),
  },
};

export const ToastVariantWarning: Story = {
  args: {
    children: (
      <>
        <ToastAutomatic variant="warning"/>
        <p className="bk-prose">A notification should appear on screen.</p>
      </>
    ),
  },
};

export const ToastVariantError: Story = {
  args: {
    children: (
      <>
        <ToastAutomatic variant="error"/>
        <p className="bk-prose">A notification should appear on screen.</p>
      </>
    ),
  },
};

export const ToastVariantSuccess: Story = {
  args: {
    children: (
      <>
        <ToastAutomatic variant="success"/>
        <p className="bk-prose">A notification should appear on screen.</p>
      </>
    ),
  },
};

export const ToastWithAutoClose: Story = {
  args: {
    children: (
      <>
        <ToastAutomatic variant="info" options={{ autoClose: 3000 }} message="I should close after 3 seconds"/>
        <p className="bk-prose">A notification should appear on screen, and then auto-close in 3 seconds.</p>
      </>
    ),
  },
};

export const ToastWithDismiss: Story = {
  args: {
    children: (
      <>
        <p>
          <Button kind="primary" label="Notify (success)"
            onPress={() => {
              notify.success({ title: 'Notification title', message: 'This is a success notification.' });
            }}
          />
        </p>
        
        <p>
        <Button kind="secondary" label="Dismiss one"
            onPress={() => { notify.dismiss('1'); }}
          />
          <Button kind="secondary" label="Dismiss all"
            onPress={() => { notify.dismissAll(); }}
          />
        </p>
      </>
    ),
  },
};

/**
 * This story demonstrates how the `notify` utility works, including notification deduplication using a `dedupeKey`.
 * 
 * - Show success notification without deduplication – Displays a standard success toast without deduplication.
 * - Show deduplicated error notification – Displays an error toast that won’t show again if a toast with the same `dedupeKey` is already visible.
 * - Dismiss all – Clears all current toasts.
 */
export const ToastWithDeduplication: Story = {
  args: {
    children: (
      <>
        <p>
          <Button
            kind="primary"
            label="Show success notification without deduplication"
            onPress={() => {
              notify.success({
                title: 'Notification title',
                message: 'this is a success notification.',
              });
            }}
          />
        </p>
        <br/>
        <p>
          <Button
            kind="primary"
            label="Show deduplicated error notification"
            onPress={() => {
              notify.error({
                title: 'Notification title',
                message: 'this is an error notification deduplicated using a key.',
              }, { dedupeKey: 'some dedupe key' });
            }}
          />
        </p>
        <br/>
        <p>
          <Button kind="secondary" label="Dismiss all"
            onPress={() => { notify.dismissAll(); }}
          />
        </p>
      </>
    ),
  },
};

