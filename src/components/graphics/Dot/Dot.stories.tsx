/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dot } from './Dot.tsx';

import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';


type DotArgs = React.ComponentProps<typeof Dot>;
type Story = StoryObj<typeof Dot>;

export default {
  component: Dot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => <Dot {...args}/>,
} satisfies Meta<DotArgs>;


// it is not possible for a story to completely replace a default decorator, so it is repeated in some stories
// see https://storybook.js.org/docs/writing-stories/decorators#decorator-inheritance
// and https://github.com/storybookjs/storybook/issues/12670
export const DotAlert: Story = {
  args: {
    event: 'alert',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Dot</div>,
  ],
};

export const DotInformational: Story = {
  args: {
    event: 'informational',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Dot</div>,
  ],
};

export const DotSuccess: Story = {
  args: {
    event: 'success',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Dot</div>,
  ],
};

export const DotWarning: Story = {
  args: {
    event: 'warning',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Dot</div>,
  ],
};

export const DotWithParagraphAndNoExtraStyling: Story = {
  args: {
    event: 'success',
  },
  decorators: [
    Story => <><Story/><LoremIpsum paragraphs={1}/></>,
  ],
};

export const DotWithParagraphAndAdditionalStyling: Story = {
  args: {
    event: 'success',
  },
  decorators: [
    Story => (
      <div style={{ display: 'grid', gap: '8px', 'align-items': 'center', 'grid-auto-flow': 'column' }}>
        <Story/>
        <LoremIpsum/>
      </div>
    ),
  ],
};
