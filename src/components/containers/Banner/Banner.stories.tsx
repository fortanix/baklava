/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Banner, BannerAction } from './Banner.tsx';
import { Button } from '../../actions/Button/Button.tsx';


type BannerArgs = React.ComponentProps<typeof Banner>;
type Story = StoryObj<BannerArgs>;

export default {
  component: Banner,
  parameters: {
    layout: 'padded', // centered, padded, or fullscreen
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => <Banner {...args}/>,
} satisfies Meta<BannerArgs>;


export const BannerInformational: Story = {
  name: 'Informational',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'informational',
  }
};

export const BannerInformationalWithNoCloseButton: Story = {
  name: 'Informational with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'informational',
  }
};

export const BannerInformationalWithSubtitle: Story = {
  name: 'Informational with subtitle',
  args: {
    title: 'Banner title',
    subtitle: 'Subtitle',
    closeButton: true,
    variant: 'informational',
  }
};

export const BannerInformationalWithButton: Story = {
  name: 'Informational with button',
  args: {
    title: 'Banner',
    subtitle: 'Subtitle text',
    closeButton: true,
    variant: 'informational',
    actions: (
      <BannerAction>
        <Button variant="tertiary" onClick={() => alert('clicked')}>Button</Button>
      </BannerAction>
    ),
  }
};

export const BannerSuccess: Story = {
  name: 'Success',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'success',
  }
};

export const BannerSuccessWithNoCloseButton: Story = {
  name: 'Success with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'success',
  }
};

export const BannerSuccessWithSubtitle: Story = {
  name: 'Success with subtitle',
  args: {
    title: 'Banner title',
    subtitle: 'Subtitle',
    closeButton: true,
    variant: 'success',
  }
};

export const BannerSuccessWithButton: Story = {
  name: 'Success with button',
  args: {
    title: 'Banner',
    subtitle: 'Subtitle text',
    closeButton: true,
    variant: 'success',
    actions: (
      <BannerAction>
        <Button variant="tertiary" onClick={() => alert('clicked')}>Button</Button>
      </BannerAction>
    ),
  }
};

export const BannerWarning: Story = {
  name: 'Warning',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'warning',
  }
};

export const BannerWarningWithNoCloseButton: Story = {
  name: 'Warning with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'warning',
  }
};

export const BannerWarningWithSubtitle: Story = {
  name: 'Warning with subtitle',
  args: {
    title: 'Banner title',
    subtitle: 'Subtitle',
    closeButton: true,
    variant: 'warning',
  }
};

export const BannerWarningWithButton: Story = {
  name: 'Warning with button',
  args: {
    title: 'Banner',
    subtitle: 'Subtitle text',
    closeButton: true,
    variant: 'warning',
    actions: (
      <BannerAction>
        <Button variant="tertiary" onClick={() => alert('clicked')}>Button</Button>
      </BannerAction>
    ),
  }
};

export const BannerAlert: Story = {
  name: 'Alert',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'alert',
  }
};

export const BannerAlertWithNoCloseButton: Story = {
  name: 'Alert with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'alert',
  }
};

export const BannerAlertWithSubtitle: Story = {
  name: 'Alert with subtitle',
  args: {
    title: 'Banner title',
    subtitle: 'Subtitle',
    closeButton: true,
    variant: 'alert',
  }
};

export const BannerAlertWithButton: Story = {
  name: 'Alert with button',
  args: {
    title: 'Banner',
    subtitle: 'Subtitle text',
    closeButton: true,
    variant: 'alert',
    actions: (
      <BannerAction>
        <Button variant="tertiary" onClick={() => alert('clicked')}>Button</Button>
      </BannerAction>
    ),
  }
};
