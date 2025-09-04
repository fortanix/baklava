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
  decorators: [
    Story => (
      <div style={{ fontSize: '5rem' }}>
        <Story/>
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {},
  args: {
    icon: 'dashboard',
  },
  render: args => (
    <Icon {...args}/>
  ),
} satisfies Meta<IconArgs>;


export const Standard: Story = {
};

export const Inline: Story = {
  render: args => (
    <article
      style={{
        maxWidth: '50rem',
        fontSize: '1.6rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1lh',
      }}
    >
      <p style={{ color: 'light-dark(#645EC3, #BDB9F3)' }}>
        Icons <Icon {...args} icon="badge-assessment"/> automatically adjust to the font size and color of the text.
      </p>
      <p>
        Another icon <Icon {...args} icon="integration" style={{ fontSize: '2em' }}/>, with a large size to
        demonstrate vertical alignment within the text.
      </p>
      <p style={{ fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.5ch', textAlign: 'start' }}>
        <Icon {...args} icon="info"/>
        Use flex layout instead of inline if the icon should be aligned to anything other than baseline.
      </p>
    </article>
  ),
};
