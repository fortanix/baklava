/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { startViewTransition } from '../../../util/reactDomUtil.ts';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsum, LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { SegmentedControl } from '../../forms/controls/SegmentedControl/SegmentedControl.tsx';

import { Banner } from './Banner.tsx';
import { DialogModal } from '../../overlays/DialogModal/DialogModal.tsx';


type BannerArgs = React.ComponentProps<typeof Banner>;
type Story = StoryObj<BannerArgs>;

// Controlled version of `Banner` (handles close state)
const BannerControlled = (props: React.ComponentProps<typeof Banner>) => {
  const viewTransitionName = React.useId();
  const [isVisible, setIsVisible] = React.useState(true);
  
  // Use a view transition to get an exit animation (in supported browsers)
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
    design: { type: 'figma', url: 'https://www.figma.com/design/ymWCnsGfIsC2zCz17Ur11Z/Design-System-UX?node-id=4573-147249&m=dev' },
  },
  decorators: [
    Story => <LayoutDecorator size="large" /*resize="inline"*/><Story/></LayoutDecorator>,
  ],
  tags: ['autodocs'],
  args: {
    onClose: () => {},
  },
  render: (args) => <BannerControlled {...args}/>,
} satisfies Meta<BannerArgs>;


const ExampleActionButton = () =>
  <Banner.ActionButton onPress={() => { notify.info('Clicked'); }}>Button</Banner.ActionButton>;
const ExampleActionIcon = () =>
  <Banner.ActionIcon icon="copy" label="Copy" onPress={() => { notify.info('Clicked'); }}/>;
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
    showCloseAction: true,
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
    showCloseAction: true,
    actions: <ExampleActionButton/>,
  },
};

/** Besides text buttons, you can also render icon buttons as actions using `Banner.ActionIcon`. */
export const BannerWithMultipleActions: Story = {
  args: {
    children: 'A banner with two actions.',
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

/** The title should always fit on a single line, if it overflows it should be truncated. */
export const BannerWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
    showCloseAction: true,
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
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

/** This shows both the title truncation and message wrap at the same time. */
export const BannerWithTitleOverflowAndTextWrap: Story = {
  args: {
    title: loremIpsum(),
    children: <LoremIpsum/>,
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

/** Banners should always look visually light themed, even when the context is in dark mode. */
export const BannerWithThemedContent: Story = {
  args: {
    title: 'Banner with themed content',
    compact: false,
    children: (
      <article className="bk-prose">
        <p>
          The following components should always have a light theme, even in dark mode:
        </p>
        <div style={{ display: 'flex', gap: '2ch', marginTop: '1lh' }}>
          <Button nonactive kind="primary" onPress={() => { notify.info('Clicked'); }}>Button</Button>
          <SegmentedControl size="small" defaultSelected="test-1" aria-label="Test segmented control">
            <SegmentedControl.Button buttonKey="test-1" label="Test 1"/>
            <SegmentedControl.Button buttonKey="test-2" label="Test 2"/>
            <SegmentedControl.Button buttonKey="test-3" label="Test 3"/>
          </SegmentedControl>
        </div>
        <div style={{ display: 'flex', gap: '2ch', marginTop: '0.5lh' }}>
          <Button kind="tertiary">Tertiary button</Button>
          <Button kind="tertiary" nonactive>Tertiary button (nonactive)</Button>
        </div>
        
        <div style={{ display: 'flex', gap: '2ch', marginTop: '0.5lh' }}>
          <DialogModal
            trigger={({ activate }) => <Button kind="primary" label="Open submodal" onPress={activate}/>}
            title="Test modal"
          >
            Content
          </DialogModal>
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
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

export const BannerSuccess: Story = {
  args: {
    variant: 'success',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

export const BannerWarning: Story = {
  args: {
    variant: 'warning',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    showCloseAction: true,
    actions: <ExampleActions/>,
  },
};

export const BannerError: Story = {
  args: {
    variant: 'error',
    compact: false,
    title: loremIpsum(),
    children: <LoremIpsum/>,
    showCloseAction: true,
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
