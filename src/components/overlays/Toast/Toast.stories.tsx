/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../actions/Button/Button.tsx';
import {
  notify,
  ToastButton,
  CopyActionButton,
  ToastLink,
  ToastMessage,
  ToastProvider,
  type NotifyProps,
} from './Toast.tsx';

type ToastArg = NotifyProps;
type Story = StoryObj<ToastArg>;

export default {
  component: ToastMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    title: 'Title',
  },
  decorators: [
    Story => (
      <ToastProvider>
        <Story/>
      </ToastProvider>
    ),
  ],
} satisfies Meta<ToastArg>;

const notificationText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, magna aliqua.`;

const Actions = () => {
  return (
    <>
      <CopyActionButton message={notificationText} />
      <ToastButton>Share</ToastButton>
    </>
  );
};

export const Success: Story = {
  args: {
    options: {},
  },
  render: (args) => (
    <Button onClick={() => notify.success(args)}>
      Notify Success
    </Button>
  ),
};

export const Info: Story = {
  args: {
    options: {},
  },
  render: (args) => (
    <Button onClick={() => notify.info(args)}>
      Notify Info
    </Button>
  ),
};

export const Error: Story = {
  args: {
    options: {},
  },
  render:  (args) => (
    <Button onClick={() => notify.error(args)}>
      Notify Error
    </Button>
  ),
};

export const ErrorWithMessage: Story = {
  args: {
    message: notificationText,
    options: {},
  },
  render:  (args) => (
    <Button onClick={() => notify.error(args)}>
      Notify Error with message (includes a default copy button)
    </Button>
  ),
};

export const SuccessWithMessageAndLink: Story = {
  args: {
    message: (
      <>
        {`${notificationText} `}
        <ToastLink href="/">Link</ToastLink>
      </>
    ),
    options: {
      autoClose: false,
    },
  },
  render:  (args) => (
    <Button onClick={() => notify.success(args)}>
      Notify success with message and link
    </Button>
  ),
};

export const SuccessWithCloseButton: Story = {
  args: {
    message: notificationText,
    options: {
      closeButton: true,
      autoClose: false,
    },
  },
  render:  (args) => (
    <Button onClick={() => notify.success(args)}>
      Notify success with close button
    </Button>
  ),
};

export const SuccessWithActions: Story = {
  args: {
    message: notificationText,
    options: {
      closeButton: true,
      autoClose: false,
      actions: <Actions />,
    },
  },
  render:  (args) => (
    <Button onClick={() => notify.success(args)}>
      Notify success with actions
    </Button>
  ),
};

export const PreventDuplicate: Story = {
  args: {
    options: {
      toastId: 'uniqueId',
    },
  },
  render:  (args) => (
    <Button onClick={() => notify.success(args)}>
      Notify
    </Button>
  ),
};

export const AddProgressBarToAllToasts: Story = {
  args: {
    message: notificationText,
    options: {
      closeButton: true,
      actions: <Actions />,
      hideProgressBar: false,
    }
  },
  render: (args) => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.success(args)}>
          Notify success with progress bar
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.info(args)}>
          Notify info with progress bar
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.error(args)}>
          Notify error with progress bar
        </Button>
      </div>
    </>
  ),
};

export const AddProgressBarToAllToastsWithAutoDelay: Story = {
  args: {
    message: notificationText,
    options: {
      delay: 3000,
      closeButton: true,
      actions: <Actions />,
      hideProgressBar: false,
    }
  },
  render: (args) => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.success(args)}>
          Notify success with progress bar after 3 seconds
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.info(args)}>
          Notify info with progress bar after 3 seconds
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => notify.error(args)}>
          Notify error with progress bar after 3 seconds
        </Button>
      </div>
    </>
  ),
};
