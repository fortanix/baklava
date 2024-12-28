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
    Story => <LayoutDecorator size="large" /*resize="inline"*/><Story/></LayoutDecorator>,
  ],
  tags: ['autodocs'],
  args: {},
  render: (args) => <BannerControlled {...args}/>,
} satisfies Meta<BannerArgs>;


const ExampleActionButton = () =>
  <Banner.ActionButton onPress={() => alert('clicked')}>Button</Banner.ActionButton>;
const ExampleActionIcon = () =>
  <Banner.ActionIcon label="Copy" onPress={() => alert('clicked')}><Icon icon="copy"/></Banner.ActionIcon>;
const ExampleActions = () => (
  <>
    <ExampleActionButton/>
    <ExampleActionIcon/>
  </>
);


export const BannerStandard: Story = {
  args: {
    title: 'Banner title',
    children: 'A message to be displayed in the banner.',
  },
};

/**
 * If the `onClose` prop is given, the component will be rendered with a close button. It is up to the consumer
 * to handle the close event and (for example) hide the `Banner`.
 */
export const BannerWithCloseButton: Story = {
  args: {
    title: `Banner title`,
    children: `A banner with a close button to hide the banner.`,
    onClose: () => {},
  },
};

export const BannerWithTitleOnly: Story = {
  args: {
    title: 'Just the title',
  },
};

/** You can specify additional custom actions to be displayed in the banner using `Banner.ActionButton`. */
export const BannerWithAction: Story = {
  args: {
    children: 'A banner with a button action.',
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

/** Besides text buttons, you can also render icon buttons as actions using `Banner.ActionIcon`. */
export const BannerWithMultipleActions: Story = {
  args: {
    children: 'A banner with two actions.',
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

/** The title should always fit on a single line, if it overflows it should be truncated. */
export const BannerWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
    onClose: () => {},
    actions: <ExampleActionButton/>,
  },
};

/**
 * In a compact banner, if the message is too long to be displayed in one line, it should automatically wrap and move
 * down to below the title. Note that the message won't extend below the buttons, if you need this behavior you must
 * explicitly set `compact` to `false`.
 */
export const BannerWithTextWrap: Story = {
  args: {
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

/** This shows both the title truncation and message wrap at the same time. */
export const BannerWithTitleOverflowAndTextWrap: Story = {
  args: {
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

/** Banners should always look visually light themed, even when the context is in dark mode. */
export const BannerWithThemedContent: Story = {
  args: {
    title: 'Banner with themed content',
    compact: false,
    children: (
      <article className="bk-body-text">
        <p>
          The following components should always have a light theme, even in dark mode:
        </p>
        <div style={{ display: 'flex', gap: '2ch', marginTop: '1lh' }}>
          <Button nonactive variant="primary" onPress={() => alert('clicked')}>Button</Button>
          <SegmentedControl
            options={['Test 1', 'Test 2']}
            defaultValue="Test 1"
          />
        </div>
      </article>
    ),
  },
};

export const BannerInformational: Story = {
  args: {
    variant: 'info',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

export const BannerSuccess: Story = {
  args: {
    variant: 'success',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

export const BannerWarning: Story = {
  args: {
    variant: 'warning',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

export const BannerError: Story = {
  args: {
    variant: 'error',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    onClose: () => {},
    actions: <ExampleActions/>,
  },
};

/** By default, subsequent banners are spaced out. To disable this, set `trimmed` to `true`. */
export const BannersStacked: Story = {
  render: args => (
    <>
      <BannerControlled {...args} variant="info" onClose={() => {}}/>
      <BannerControlled {...args} variant="warning" onClose={() => {}}/>
      <BannerControlled {...args} variant="error" onClose={() => {}}/>
      <BannerControlled {...args} variant="success" onClose={() => {}}/>
    </>
  ),
};

/** If `trimmed` is enabled, no exterior spacing is applied. */
export const BannersStackedTrimmed: Story = {
  render: args => (
    <>
      <BannerControlled trimmed {...args} variant="info" onClose={() => {}}/>
      <BannerControlled trimmed {...args} variant="warning" onClose={() => {}}/>
      <BannerControlled trimmed {...args} variant="error" onClose={() => {}}/>
      <BannerControlled trimmed {...args} variant="success" onClose={() => {}}/>
    </>
  ),
};
