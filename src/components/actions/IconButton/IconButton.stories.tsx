/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { colorBright } from '../../../util/storybook/StorybookUtils.tsx';

import { notify } from '../../overlays/ToastProvider/ToastProvider.tsx';

import { IconButton } from './IconButton.tsx';


type IconButtonArgs = React.ComponentProps<typeof IconButton>;
type Story = StoryObj<IconButtonArgs>;

export default {
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    label: 'Visible',
    icon: 'eye-open',
    onPress: () => { notify.info(`You clicked the icon button`); },
  },
  render: (args) => <IconButton {...args}/>,
} satisfies Meta<IconButtonArgs>;


export const IconButtonStandard: Story = {};

export const IconButtonInline: Story = {
  decorators: [
    Story => (
      <article
        className="bk-prose"
        style={{
          maxWidth: '60ch',
          fontSize: '1.6rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6lh',
        }}
      >
        <p style={{ color: colorBright }}>
          By default, <code>IconButton</code> elements are rendered inline.
          {' '}
          <Story/>
          {' '}
          It should have the same color and font size as the rest of the paragraph.
        </p>
      </article>
    ),
  ],
};

export const IconButtonIsolated: Story = {
  decorators: [
    Story => (
      <article
        className="bk-prose"
        style={{
          maxWidth: '60ch',
          fontSize: '1.6rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6lh',
        }}
      >
        <p style={{ color: colorBright }}>
          When <code>inline="false"</code>, <code>IconButton</code> is displayed as an isolated, block-level element:
          {' '}
          <Story/>
          {' '}
          It should have the default color and normal font size, and be rendered as a block-level element, even inside
          of a paragraph with custom styling.
        </p>
      </article>
    ),
  ],
  args: {
    inline: false,
  },
};
