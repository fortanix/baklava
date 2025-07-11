/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @ts-ignore
import iconIds from 'virtual:svg-icons-names';

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';

import { SpriteIcon } from './Icon.tsx';


const legacyIconIds = iconIds
  .filter(iconId => iconId.startsWith('baklava-icon-legacy-'))
  .map(iconId => iconId.replace('baklava-icon-legacy-', ''));

type IconArgs = React.ComponentProps<typeof SpriteIcon>;
type Story = StoryObj<IconArgs>;

export default {
  component: SpriteIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    name: 'account',
  },
  render: (args) => <SpriteIcon {...args}/>,
} satisfies Meta<IconArgs>;


export const IconStandard: Story = {};

export const IconWithColor: Story = {
  args: {
    style: { color: 'red' },
  },
};

export const IconInText: Story = {
  decorators: [
    Story => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8lh' }}>
        <p style={{ fontSize: '0.8em' }}>{loremIpsumSentence} <Story/> {loremIpsumSentence}</p>
        <p style={{ fontSize: '1em' }}>{loremIpsumSentence} <Story/> {loremIpsumSentence}</p>
        <p style={{ fontSize: '1.2em' }}>{loremIpsumSentence} <Story/> {loremIpsumSentence}</p>
      </div>
    ),
  ],
};

export const IconPackList: Story = {
  render: () => (
    <ul style={{ display: 'grid', gap: '0.8em', gridTemplateColumns: 'repeat(20, max-content)' }}>
      {legacyIconIds.map(legacyIconId => <li key={legacyIconId}><SpriteIcon name={legacyIconId}/></li>)}
    </ul>
  ),
};
