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
    onClose: () => {},
  },
  render: (args) => <BannerWithCloseState {...args}/>,
};

export const BannerWithMessage: Story = {
  args: {
    message: 'This is the main message of the banner.',
    onClose: () => {},
  },
};

export const BannerWithButton: Story = {
  args: {
    message: 'Message text',
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};


export const BannerWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerWithTextWrap: Story = {
  args: {
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerWithTitleOverflowAndTextWrap: Story = {
  args: {
    title: loremIpsum(),
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerInformational: Story = {
  args: {
    variant: 'informational',
    title: loremIpsum(),
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerSuccess: Story = {
  args: {
    variant: 'success',
    title: loremIpsum(),
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerWarning: Story = {
  args: {
    variant: 'warning',
    title: loremIpsum(),
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};

export const BannerError: Story = {
  args: {
    variant: 'error',
    title: loremIpsum(),
    message: <LoremIpsum/>,
    onClose: () => {},
    actions: <BannerActionExample/>,
  },
};
