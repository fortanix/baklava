/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyBkLinkWithNotify } from '../../../util/storybook/StorybookLink.tsx';

import { LinkAsButton } from './LinkAsButton.tsx';


type LinkAsButtonArgs = React.ComponentProps<typeof LinkAsButton>;
type Story = StoryObj<typeof LinkAsButton>;

export default {
  component: LinkAsButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    kind: 'primary',
    label: 'Link',
    href: 'https://fortanix.com',
    target: '_blank',
    onClick: event => { event.preventDefault(); },
  },
  render: (args) => <LinkAsButton {...args}/>,
} satisfies Meta<LinkAsButtonArgs>;


export const LinkAsButtonStandard: Story = {};

export const LinkAsButtonTrimmed: Story = {
  args: {
    kind: 'tertiary',
    trimmed: true,
  },
};

export const LinkAsButtonWithCustomLink: Story = {
  args: {
    Link: DummyBkLinkWithNotify,
    onClick: undefined,
  },
};

export const LinkAsButtonVariants: Story = {
  render: (args) => (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'repeat(3, 1fr)',
      gridAutoFlow: 'column',
      gap: '1rem',
    }}>
      <p><LinkAsButton {...args} kind="primary"/></p>
      <p><LinkAsButton {...args} kind="primary" nonactive/></p>
      <p><LinkAsButton {...args} kind="primary" disabled/></p>
      
      <p><LinkAsButton {...args} kind="secondary"/></p>
      <p><LinkAsButton {...args} kind="secondary" nonactive/></p>
      <p><LinkAsButton {...args} kind="secondary" disabled/></p>
      
      <p><LinkAsButton {...args} kind="tertiary"/></p>
      <p><LinkAsButton {...args} kind="tertiary" nonactive/></p>
      <p><LinkAsButton {...args} kind="tertiary" disabled/></p>
    </div>
  ),
};

/**
 * The `download` property can be used to trigger the download of a file, where `download` specifies the file name and
 * `href` contains the content of the file to be downloaded as a `data:` URL.
 */
export const LinkAsButtonWithDownload: Story = {
  args: {
    kind: 'tertiary',
    download: 'my_file.txt',
    label: 'Download',
    href: `data:text/plain,Lorem ipsum`,
    onClick: undefined,
  },
};
