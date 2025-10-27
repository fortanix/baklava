/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { DummyBkLinkWithNotify } from '../../../util/storybook/StorybookLink.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Link } from '../Link/Link.tsx';
import { LinkAsButton } from '../LinkAsButton/LinkAsButton.tsx';
import { Card } from '../../containers/Card/Card.tsx';

import { CardAction } from './CardAction.tsx';


const handlePress = () => { notify.info('Pressed'); };
const handleClick = (event: React.MouseEvent) => { event.preventDefault(); notify.info('Clicked'); };

type CardActionArgs = React.ComponentProps<typeof CardAction>;
type Story = StoryObj<CardActionArgs>;

export default {
  component: CardAction,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Button label="Action" onPress={handlePress}/>
      </>
    ),
  },
  render: (args) => <CardAction {...args}/>,
  decorators: [Story => <LayoutDecorator size="x-small"><Story/></LayoutDecorator>],
} satisfies Meta<CardActionArgs>;


export const CardActionStandard: Story = {};

export const CardActionHover: Story = {
  args: {
    className: 'pseudo-hover',
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Button label="Action" onPress={handlePress} className="pseudo-hover"/>
      </>
    ),
  },
};

export const CardActionFocused: Story = {
  args: {
    className: 'pseudo-focus-visible',
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Button label="Action" onPress={handlePress} className="pseudo-focus-visible"/>
      </>
    ),
  },
};

export const CardActionSelected: Story = {
  args: {
    selected: true,
    children: (
      <>
        <CardAction.Button kind="tertiary" label="Selected" onPress={handlePress} icon="check"/>
      </>
    ),
  },
};

export const CardActionDisabled: Story = {
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Button disabled label="Disabled" onPress={handlePress}/>
      </>
    ),
  },
};

export const CardActionSelectedDisabled: Story = {
  args: {
    selected: true,
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Button disabled label="Disabled" onPress={handlePress}/>
      </>
    ),
  },
};

export const CardActionWithCustomButton: Story = {
  args: {
    children: (
      <>
        <CardAction.Button kind="tertiary" label="Install" onPress={handlePress}
          icon="install"
        />
      </>
    ),
  },
};

export const CardActionWithLink: Story = {
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Link Link={DummyBkLinkWithNotify}>Link</CardAction.Link>
      </>
    ),
  },
};

const CustomLinkC = (props: React.ComponentProps<typeof Link>) =>
  <LinkAsButton {...props} kind="secondary" href="/" style={{ alignSelf: 'stretch' }} onClick={handleClick}/>;
export const CardActionWithCustomLink: Story = {
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.Link Link={CustomLinkC}>Custom link</CardAction.Link>
      </>
    ),
  },
};

export const CardActionWithButtonAsLink: Story = {
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.ButtonAsLink>Button as link</CardAction.ButtonAsLink>
      </>
    ),
  },
};

export const CardActionWithLinkAsButton: Story = {
  args: {
    children: (
      <>
        <CardAction.Content>Some content</CardAction.Content>
        <CardAction.LinkAsButton Link={DummyBkLinkWithNotify}>Link as button</CardAction.LinkAsButton>
      </>
    ),
  },
};

export const CardActionWithHeading: Story = {
  args: {
    children: (
      <>
        <CardAction.Heading icon={<Icon icon="account"/>}>Card heading – Will wrap if too long</CardAction.Heading>
        <CardAction.Content>Content</CardAction.Content>
        <CardAction.Button label="Action" onPress={handlePress}/>
      </>
    ),
  },
};

export const CardActionWithSubgrid: Story = {
  args: {
    children: (
      <>
        <CardAction.Heading icon={<Icon icon="account"/>}>Card heading – Will wrap if too long</CardAction.Heading>
        <CardAction.Content style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <Card flat>Cell 1</Card>
          <Card flat>Cell 2</Card>
        </CardAction.Content>
        <CardAction.Button label="Action" onPress={handlePress}/>
      </>
    ),
  },
};
