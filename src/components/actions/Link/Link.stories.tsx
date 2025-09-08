/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DummyLink } from '../../../util/storybook/StorybookLink.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';

import { Link } from './Link.tsx';


type LinkArgs = React.ComponentProps<typeof Link>;
type Story = StoryObj<typeof Link>;

export default {
  component: Link,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D41%253A5563%26t%3DaJEqUzt6fUeABwmK-1' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    label: 'Link',
    href: '/',
    onClick: event => { event.preventDefault(); },
  },
  render: (args) => <Link {...args}/>,
} satisfies Meta<LinkArgs>;


export const LinkStandard: Story = {};

export const LinkSmall: Story = {
  args: { size: 'small' },
};

export const LinkDisabled: Story = {
  args: { disabled: true, href: 'https://example.com?SHOULD_NOT_NAVIGATE', onClick: undefined },
};

/**
 * Story to test the visual styling of descender characters like "p" and "y" in combination with the link underline.
 */
export const LinkWithDescenders: Story = {
  args: { label: 'parapsychologists' },
};

export const LinkWithScroll: Story = {
  render: (args) => (
    <>
      <DummyLink id="anchor">Anchor</DummyLink>
      <OverflowTester openDefault/>
      <Link {...args} href="#anchor" onClick={undefined}/>
      <OverflowTester openDefault/>
    </>
  ),
};
