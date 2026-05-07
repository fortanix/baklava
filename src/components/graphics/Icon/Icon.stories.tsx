/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from './Icon.tsx';


type IconArgs = React.ComponentProps<typeof Icon>;
type Story = StoryObj<typeof Icon>;

export default {
  component: Icon,
  parameters: {
    layout: 'centered',
    //design: { type: 'figma', url: '' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    icon: 'dashboard',
  },
  render: args => <Icon {...args}/>,
} satisfies Meta<IconArgs>;


export const IconStandard: Story = {
  decorators: [
    Story => <div style={{ fontSize: '5rem' }}><Story/></div>,
  ],
};

export const IconInline: Story = {
  render: args => (
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
      <p style={{ color: 'light-dark(#645EC3, #BDB9F3)' }}>
        Icons <Icon {...args} icon="badge-assessment"/> are inline by default, they automatically adjust to the font size and color of the text. The alignment of an icon <Icon {...args} icon="settings"/> should be such
        that it fits naturally in the paragraph.
      </p>
      <p>
        Icons can be scaled up or down by changing the font size. For instance, the following icon has a font size
        of <code>2em</code> making it twice as large as the surrounding text:
        {' '}
        <Icon {...args} icon="integration" style={{ fontSize: '2em' }}/>.
        {' '}
        This icon should be rendered much larger, but its vertical alignment should still look "natural" (sitting
        slightly below the baseline).
      </p>
      <p style={{ fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.5ch', textAlign: 'start' }}>
        <Icon {...args} icon="info"/>
        Use flex layout instead of inline if the icon should be aligned to anything other than baseline.
      </p>
    </article>
  ),
};

export const IconIsolated: Story = {
  render: args => (
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
      <p className="bk-prose" style={{ color: 'light-dark(#645EC3, #BDB9F3)' }}>
        When <code>inline="false"</code> is set on the icon, it will be isolated from its context:
        <Icon {...args} icon="solutions"/>
        This icon should have default color and font size, and it should be rendered as a block-level element.
      </p>
    </article>
  ),
  args: {
    inline: false,
  },
};

export const IconWithDecoration: Story = {
  args: {
    decoration: { type: 'background-circle' },
  },
};

export const IconEventWarning: StoryObj<typeof Icon.Event> = {
  decorators: [
    Story => <div style={{ fontSize: '5rem' }}><Story/></div>,
  ],
  render: args => <Icon.Event {...args}/>,
  args: {
    event: 'warning',
  },
};
