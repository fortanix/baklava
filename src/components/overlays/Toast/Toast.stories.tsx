/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Tooltip } from '../Tooltip/Tooltip.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import { notify, CopyActionButton, ToastMessage, ToastContainer } from './Toast.tsx';


type ToastArg = React.ComponentProps<typeof ToastContainer>;
type Story = StoryObj<ToastArg>;

export default {
  component: ToastContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<ToastArg>;

const notificationText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
nisi ut aliquip ex ea commodo consequat.`;

const Actions = () => {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <>
      <div className="bkl-notification__buttons">
        {/* TODO: replace a element with Link component later */}
        <a href="/" target="_blank" rel="noopener noreferrer" onClick={onClick}>
          Go to settings
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer" onClick={onClick}>
          Learn more
        </a>
      </div>
      <CopyActionButton message={notificationText} />
    </>
  );
};

const ActionsInline = () => {
  return (
    <Tooltip placement="top" content="Send email" className="bkl-notification__tooltip">
      <Icon icon="email" onClick={() => window.open('mailto:test@fortanix.com')} />
    </Tooltip>
  );
};

export const Success: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.success(notificationText)}>
        Notify Success
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const Info: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.info(notificationText)}>
        Notify Info
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const Error: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.error(notificationText)}>
        Notify Error
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const WithActions: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.info(notificationText, { actions: <Actions />, autoClose: false })}>
        Notify Info with actions
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const WithActionsInline: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.info(notificationText, { actionsInline: <ActionsInline />, autoClose: false })}>
        Notify Info with actions inline
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const WithActionsAndActionsInline: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.info(notificationText, { actions: <Actions />, actionsInline: <ActionsInline />, autoClose: false })}>
        Notify Info with actions and actions inline
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const PreventDuplicate: Story = {
  render:  (args) => (
    <>
      <Button onClick={() => notify.success(notificationText, { toastId: 'uniqueId' })}>
        Notify
      </Button>
      <ToastContainer {...args}/>
    </>
  ),
};

export const AddProgressBarToAllToasts: Story = {
  render: (args) => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.success(notificationText); }}>
          Notify success
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.info(notificationText); }}>
          Notify info
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.error(notificationText); }}>
          Notify error
        </Button>
      </div>
      <ToastContainer showProgressBar  {...args}/>
    </>
  ),
};

export const AddProgressBarToSelectedToasts: Story = {
  render: (args) => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.success(notificationText, { hideProgressBar: false }); }}>
          Notify success with progress bar
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.info(notificationText); }}>
          Notify info
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => { notify.error(notificationText, { hideProgressBar: false }); }}>
          Notify error with progress bar
        </Button>
      </div>
      <ToastContainer {...args}/>
    </>
  ),
};
