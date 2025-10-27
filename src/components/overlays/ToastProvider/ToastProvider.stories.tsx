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

export const ToastWithPromise: Story = {
  args: {
    children: (
      <>
        <div className="bk-prose">
          <h3>Promise Toast Examples</h3>
          <p>Click the buttons below to see how <code>notify.promise</code> handles different async scenarios:</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button 
            kind="primary" 
            label="Success Promise"
            onPress={() => {
              const promise = new Promise((resolve) => 
                setTimeout(() => resolve({ name: 'Baklava' }), 2000)
              );
              
              notify.promise(promise, {
                loading: 'Loading data...',
                success: (data: any) => `Successfully loaded ${data.name}!`,
                error: 'Failed to load data',
              });
            }}
          />
          
          <Button 
            kind="primary" 
            label="Error Promise"
            onPress={() => {
              const promise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network error')), 1500)
              );
              
              notify.promise(promise, {
                loading: 'Attempting to connect...',
                success: 'Connected successfully!',
                error: (error: Error) => `Connection failed: ${error.message}`,
              });
            }}
          />
          
          <Button 
            kind="secondary" 
            label="Quick Success"
            onPress={() => {
              const promise = Promise.resolve({ count: 42 });
              
              notify.promise(promise, {
                loading: 'Processing...',
                success: (data: any) => `Processed ${data.count} items`,
                error: 'Processing failed',
              });
            }}
          />
          
          <Button 
            kind="secondary" 
            label="With Custom Options"
            onPress={() => {
              const promise = new Promise((resolve) => 
                setTimeout(() => resolve('Custom result'), 1000)
              );
              
              notify.promise(promise, {
                loading: { 
                  message: 'Custom loading message...', 
                  title: 'Processing' 
                },
                success: { 
                  message: 'Custom success!', 
                  title: 'Completed',
                  options: { autoClose: 5000 }
                },
                error: { 
                  message: 'Custom error message', 
                  title: 'Failed' 
                },
              });
            }}
          />
          
          <Button 
            kind="tertiary" 
            label="Only Loading"
            onPress={() => {
              const promise = new Promise((resolve) => 
                setTimeout(() => resolve('Done'), 1000)
              );
              
              notify.promise(promise, {
                loading: 'Just showing loading state...',
              });
            }}
          />
          
          <Button 
            kind="tertiary" 
            label="No Loading State"
            onPress={() => {
              const promise = new Promise((resolve) => 
                setTimeout(() => resolve({ result: 'background task' }), 2000)
              );
              
              notify.promise(promise, {
                success: (data: any) => `Background ${data.result} completed silently`,
                error: 'Background task failed',
              });
            }}
          />
        </div>
      </>
    ),
  },
};
