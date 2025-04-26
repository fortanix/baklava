/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';
import { Select } from './Select.tsx';


type SelectArgs = React.ComponentProps<typeof Select>;
type Story = StoryObj<SelectArgs>;

export default {
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <Select {...args}/>,
} satisfies Meta<SelectArgs>;


export const SelectStandard: Story = {
  args: {
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <Select.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
};

export const SelectInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
          }}
        />
        <Story/>
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],
  args: {
    form: 'story-form',
    name: 'story_component1',
    options: (
      <>
        {Array.from({ length: 8 }, (_, i) => i + 1).map(index =>
          <Select.Option key={`option-${index}`} itemKey={`option-${index}`} label={`Option ${index}`}/>
        )}
      </>
    ),
  },
};
