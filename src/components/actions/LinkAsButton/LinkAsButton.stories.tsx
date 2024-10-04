/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LinkAsButton } from './LinkAsButton.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';


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
    unstyled: false,
    variant: 'primary',
    label: 'Link',
    href: 'https://fortanix.com',
    target: '_blank',
  },
  render: (args) => <LinkAsButton {...args}/>,
} satisfies Meta<LinkAsButtonArgs>;


export const Standard: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridAutoFlow: 'row',
      gap: '1rem',
    }}>
      <p><LinkAsButton {...args} variant="primary"/></p>
      <p><LinkAsButton {...args} variant="primary" nonactive/></p>
      <p><LinkAsButton {...args} variant="primary" disabled/></p>
      
      <p><LinkAsButton {...args} variant="secondary"/></p>
      <p><LinkAsButton {...args} variant="secondary" nonactive/></p>
      <p><LinkAsButton {...args} variant="secondary" disabled/></p>
      
      <p><LinkAsButton {...args} variant="tertiary"/></p>
      <p><LinkAsButton {...args} variant="tertiary" nonactive/></p>
      <p><LinkAsButton {...args} variant="tertiary" disabled/></p>
    </div>
  ),
};

/**
 * The `download` property can be used to trigger the download of a file, where `download` specifies the file name and
 * `href` contains the content of the file to be downloaded as a `data:` URL.
 */
export const Download: Story = {
  args: {
    variant: 'tertiary',
    download: 'my_file.txt',
    label: 'Download',
    href: `data:text/plain,Lorem ipsum`,
  },
};
