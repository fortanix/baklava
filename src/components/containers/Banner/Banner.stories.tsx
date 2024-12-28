/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { idToCssIdent } from '../../../util/reactUtil.ts';
import { startViewTransition } from '../../../util/reactDomUtil.ts';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsum, LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { SegmentedControl } from '../../forms/controls/SegmentedControl/SegmentedControl.tsx';

import { Banner } from './Banner.tsx';


type BannerArgs = React.ComponentProps<typeof Banner>;
type Story = StoryObj<BannerArgs>;

// Controlled version of `Banner` (handles close state)
const BannerControlled = (props: React.ComponentProps<typeof Banner>) => {
  const viewTransitionName = idToCssIdent(React.useId());
  const [isVisible, setIsVisible] = React.useState(true);
  
  // Use a view transition to get an exit animation in supported browsers
  const handleClose = React.useCallback(() => {
    startViewTransition(() => {
      setIsVisible(false);
      props.onClose?.();
    });
  }, [props.onClose]);
  
  if (!isVisible) { return null; }
  
  return (
    <Banner
      {...props}
      onClose={props.onClose ? handleClose : undefined}
      style={{
        viewTransitionName,
        //resize: 'inline',
        ...(props.style ?? {}),
      }}
    />
  );
};

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
  render: (args) => <BannerControlled {...args}/>,
} satisfies Meta<BannerArgs>;


const ExampleActionButton = () =>
  <Banner.ActionButton onPress={() => alert('clicked')}>Button</Banner.ActionButton>;
const ExampleActionIcon = () =>
  <Banner.ActionIcon label="Copy" onPress={() => alert('clicked')}><Icon icon="copy"/></Banner.ActionIcon>;


export const BannerStandard: Story = {};

export const BannerWithCloseButton: Story = {
  args: {
    onClose: () => {},
  },
};

export const BannerWithMessage: Story = {
  args: {
    children: 'This is the main message of the banner.',
    onClose: () => {},
  },
};

export const BannerWithButton: Story = {
  args: {
    children: 'Message text',
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerWithButtonAndIcon: Story = {
  args: {
    children: 'Message text',
    onClose: () => {},
    actions: (
      <>
        <ExampleActionButton/>
        <ExampleActionIcon/>
      </>
    ),
  },
};


export const BannerWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerWithTextWrap: Story = {
  args: {
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerWithTitleOverflowAndTextWrap: Story = {
  args: {
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerWithThemedContent: Story = {
  args: {
    title: loremIpsum(),
    children: (
      <article>
        <p className="bk-body-text">
          Banners look visually light, even in dark mode. The following components should always have a light theme:
        </p>
        <p>
          <Button nonactive variant="primary" onPress={() => alert('clicked')}>Button</Button>
        </p>
        <SegmentedControl
          options={['Test 1', 'Test 2']}
          defaultValue="Test 1"
        />
      </article>
    ),
  },
};

export const BannerInformational: Story = {
  args: {
    variant: 'info',
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerSuccess: Story = {
  args: {
    variant: 'success',
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerWarning: Story = {
  args: {
    variant: 'warning',
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannerError: Story = {
  args: {
    variant: 'error',
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

export const BannersStacked: Story = {
  render: args => (
    <>
      <BannerControlled {...args} variant="informational" onClose={() => {}}/>
      <BannerControlled {...args} variant="warning" onClose={() => {}}/>
      <BannerControlled {...args} variant="error" onClose={() => {}}/>
      <BannerControlled {...args} variant="success" onClose={() => {}}/>
    </>
  ),
};
