/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumParagraph } from '../../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../buttons/Button.tsx';

import { NotificationContainer, notify } from './Notification.tsx';


type NotificationArgs = React.ComponentProps<typeof NotificationContainer> & { story: React.ReactNode };
type Story = StoryObj<NotificationArgs>;

export default {
  component: NotificationContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
  },
  render: ({ story, ...args }) => <><NotificationContainer {...args}/>{story}</>,
} satisfies Meta<NotificationArgs>;


export const NotificationStandard: Story = {
  args: {
    story: (
      <Button
        onClick={() => {
          notify.info('This a toast notification', { autoClose: false });
        }}
      >
        Trigger notification
      </Button>
    ),
  },
};

export const NotificationInfo: Story = {
  args: {
    story: (
      <Button onClick={() => { notify.info('Info'); }}>Trigger notification</Button>
    ),
  },
};
export const NotificationSuccess: Story = {
  args: {
    story: (
      <Button onClick={() => { notify.success('Success'); }}>Trigger notification</Button>
    ),
  },
};
export const NotificationError: Story = {
  args: {
    story: (
      <Button onClick={() => { notify.error('Error'); }}>Trigger notification</Button>
    ),
  },
};

export const NotificationWithActions: Story = {
  args: {
    story: (
      <Button
        onClick={() => {
          notify.error(loremIpsumParagraph, {
            autoClose: false,
            actionsInline: <Button>Inline action</Button>,
            actions: <Button>Action</Button>,
          });
        }}
      >
        Trigger notification
      </Button>
    ),
  },
};
