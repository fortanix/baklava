/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';

import { TextLine } from './TextLine.tsx';


type TextLineArgs = React.ComponentProps<typeof TextLine>;
type Story = StoryObj<TextLineArgs>;

export default {
  component: TextLine,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: loremIpsumSentence,
  },
  render: (args) => <TextLine {...args}/>,
} satisfies Meta<TextLineArgs>;


/** The `TextLine` element displays a single line of text content. */
export const TextLineStandard: Story = {};

/** When the text overflows its container, it will be truncated with an ellipsis. */
export const TextLineWithOverflow: Story = {
  decorators: [
    Story => (
      <div style={{ display: 'grid', resize: 'inline', overflow: 'hidden', width: '30ch' }}>
        <Story/>
      </div>
    ),
  ],
  args: {
    showOverflowTooltip: false,
  },
};

/** In case of overflow, a tooltip can be shown on hover to show the full text content. */
export const TextLineWithOverflowTooltip: Story = {
  decorators: [
    Story => (
      <div style={{ display: 'grid', resize: 'inline', overflow: 'hidden', width: '30ch' }}>
        <Story/>
      </div>
    ),
  ],
  args: {
    showOverflowTooltip: true,
  },
};
