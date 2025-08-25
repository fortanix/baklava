/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { FortanixLogo } from './FortanixLogo.tsx';
import { LoremIpsum } from '../../util/storybook/LoremIpsum.tsx';
import { LayoutDecorator } from '../../util/storybook/LayoutDecorator.tsx';


type FortanixLogoArgs = React.ComponentProps<typeof FortanixLogo>;
type Story = StoryObj<FortanixLogoArgs>;

export default {
  component: FortanixLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => <div style={{ fontSize: '3rem' }}><Story/></div>,
  ],
  argTypes: {},
  render: (args) => <FortanixLogo {...args} />,
} satisfies Meta<FortanixLogoArgs>;


export const FortanixLogoStandard: Story = {};

/** The logo scales with the font size. */
export const FortanixLogoInText: Story = {
  decorators: [
    Story => (
      <div style={{ '--font-size': '1.2rem', fontSize: 'var(--font-size)' }}>
        <LoremIpsum style={{ fontSize: 'var(--font-size)' }}/>
        <Story/>
        <LoremIpsum style={{ fontSize: 'var(--font-size)' }}/>
      </div>
    ),
  ],
};

export const FortanixLogoWithSubtitle: Story = {
  args: {
    subtitle: 'Data Security Manager',
    subtitleTrademark: true,
  },
};

