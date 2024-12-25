/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsum, LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Banner, BannerAction } from './Banner.tsx';
import { Button } from '../../actions/Button/Button.tsx';


type BannerArgs = React.ComponentProps<typeof Banner>;
type Story = StoryObj<BannerArgs>;

export default {
  component: Banner,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => <LayoutDecorator size="large"><Story/></LayoutDecorator>,
  ],
  tags: ['autodocs'],
  argTypes: {},
  args: {
    title: 'Banner title',
  },
  render: (args) => <Banner {...args}/>,
} satisfies Meta<BannerArgs>;


// Utility components
const BannerWithCloseState = (props: React.ComponentProps<typeof Banner>) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  if (!isVisible) { return null; }
  return <Banner {...props} onClose={() => { setIsVisible(false); }}/>;
};

const BannerActionExample = () => (
  <BannerAction>
    <Button variant="tertiary" onPress={() => alert('clicked')}>Button</Button>
  </BannerAction>
);


export const BannerStandard: Story = {};

export const BannerWithCloseButton: Story = {
  args: {
    closeButton: true,
  },
  render: (args) => <BannerWithCloseState {...args}/>,
};

export const BannerWithMessage: Story = {
  args: {
    message: 'This is the main message of the banner.',
    closeButton: true,
  },
};

export const BannerWithButton: Story = {
  args: {
    message: 'Message text',
    closeButton: true,
    actions: <BannerActionExample/>,
  },
};


export const BannerWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
    closeButton: true,
    actions: <BannerActionExample/>,
  },
};

export const BannerWithTextWrap: Story = {
  args: {
    message: <LoremIpsum/>,
    closeButton: true,
    actions: <BannerActionExample/>,
  },
};

export const BannerWithTitleOverflowAndTextWrap: Story = {
  args: {
    title: loremIpsum(),
    message: <LoremIpsum/>,
    closeButton: true,
    actions: <BannerActionExample/>,
  },
};

export const BannerInformational: Story = {
  name: 'Success',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'informational',
  },
};

export const BannerSuccess: Story = {
  name: 'Success',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'success',
  },
};

export const BannerSuccessWithNoCloseButton: Story = {
  name: 'Success with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'success',
  },
};

export const BannerSuccessWithMessage: Story = {
  name: 'Success with message',
  args: {
    title: 'Banner title',
    message: 'Message',
    closeButton: true,
    variant: 'success',
  },
};

export const BannerSuccessWithButton: Story = {
  name: 'Success with button',
  args: {
    title: 'Banner',
    message: 'Message text',
    closeButton: true,
    variant: 'success',
    actions: <BannerActionExample/>,
  },
};

export const BannerWarning: Story = {
  name: 'Warning',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'warning',
  },
};

export const BannerWarningWithNoCloseButton: Story = {
  name: 'Warning with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'warning',
  },
};

export const BannerWarningWithMessage: Story = {
  name: 'Warning with message',
  args: {
    title: 'Banner title',
    message: 'Message',
    closeButton: true,
    variant: 'warning',
  },
};

export const BannerWarningWithButton: Story = {
  name: 'Warning with button',
  args: {
    title: 'Banner',
    message: 'Message text',
    closeButton: true,
    variant: 'warning',
    actions: <BannerActionExample/>,
  },
};

export const BannerAlert: Story = {
  name: 'Alert',
  args: {
    title: 'Banner title',
    closeButton: true,
    variant: 'error',
  },
};

export const BannerAlertWithNoCloseButton: Story = {
  name: 'Alert with no close button',
  args: {
    title: 'Banner title',
    closeButton: false,
    variant: 'error',
  },
};

export const BannerAlertWithMessage: Story = {
  name: 'Alert with message',
  args: {
    title: 'Banner title',
    message: 'Message',
    closeButton: true,
    variant: 'error',
  },
};

export const BannerAlertWithButton: Story = {
  name: 'Alert with button',
  args: {
    title: 'Banner',
    message: 'Message text',
    closeButton: true,
    variant: 'error',
    actions: <BannerActionExample/>,
  },
};
