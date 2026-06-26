/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoremIpsum, loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';
import { colorBright } from '../../../util/storybook/StorybookUtils.tsx';
import { Prose } from '../../../typography/Prose/Prose.tsx';

import { Dot } from './Dot.tsx';


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


export const DotStandard: Story = {};

export const DotWithCustomStyling: Story = {
  decorators: [Story => <p><Story/> Dot with custom color and size</p>],
  args: {
    style: { color: colorBright, fontSize: '2em' }
  },
};

// it is not possible for a story to completely replace a default decorator, so it is repeated in some stories
// see https://storybook.js.org/docs/writing-stories/decorators#decorator-inheritance
// and https://github.com/storybookjs/storybook/issues/12670
export const DotCritical: Story = {
  args: {
    event: 'critical',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Critical</div>,
  ],
};

export const DotInformational: Story = {
  args: {
    event: 'informational',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Informational</div>,
  ],
};

export const DotSuccess: Story = {
  args: {
    event: 'success',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Success</div>,
  ],
};

export const DotWarning: Story = {
  args: {
    event: 'warning',
  },
  decorators: [
    Story => <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}><Story/> Warning</div>,
  ],
};

export const DotInParagraph: Story = {
  args: {
    event: 'success',
  },
  decorators: [
    Story => (
      <Prose>
        <p>{loremIpsumSentence} <Story/> {loremIpsumSentence}</p>
      </Prose>
    ),
  ],
};
