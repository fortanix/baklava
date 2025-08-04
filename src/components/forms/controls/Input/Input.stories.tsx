/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { Input } from './Input.tsx';


type InputArgs = React.ComponentProps<typeof Input>;
type Story = StoryObj<InputArgs>;

export default {
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    placeholder: 'Example',
  },
  decorators: [
    Story => <form onSubmit={event => { event.preventDefault(); }}><Story/></form>,
  ],
  render: (args) => <Input {...args}/>,
} satisfies Meta<InputArgs>;


export const InputStandard: Story = {
};

export const InputFocused: Story = {
  args: {
    className: 'pseudo-focus',
  },
};

export const InputDisabled: Story = {
  args: {
    defaultValue: 'A disabled input',
    disabled: true,
  },
};

export const InputInvalid: Story = {
  args: {
    required: true,
    pattern: '\d+',
    className: 'invalid',
    value: 'invalid input',
  },
  /*
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Example');
    const form = input.closest('form');
    if (!form) { throw new Error(`Missing <form> element`); }
    
    await delay(100);
    await userEvent.type(input, 'invalid');
    await delay(100);
    await userEvent.keyboard('{Enter}');
    await fireEvent.submit(form);
    await userEvent.click(form);
  },
  */  
};

/** Note: if you use an input as a search input, make sure to embed it inside a `<search>` element. */
export const InputWithIcon: Story = {
  args: {
    icon: 'search',
    iconLabel: 'Search',
  },
};

export const InputWithCustomFontSize: Story = {
  args: {
    style: { fontSize: '2em' },
  },
};

const CustomIcon: React.ComponentProps<typeof Input>['Icon'] = props => "🍕";
export const InputWithCustomIcon: Story = {
  args: {
    Icon: CustomIcon,
  },
};

export const InputWithAction: Story = {
  args: {
    actions: <Input.Action icon="cross" label="Reset" onPress={() => { notify.info('Clicked'); }}/>,
  },
};

export const InputWithIconAndActions: Story = {
  args: {
    icon: 'search',
    iconLabel: 'Search',
    actions: (
      <>
        <Input.Action icon="cross" label="Clear input" onPress={() => { notify.info('Clicked'); }}/>
        <Input.Action icon="caret-down" label="Open menu" onPress={() => { notify.info('Clicked'); }}/>
      </>
    ),
  },
};

export const InputWithTypePassword: Story = {
  args: {
    type: 'password',
    value: 'example$password',
  },
};

/** In the following story, the input should be automatically focused on mount. */
export const InputWithAutoFocus: Story = {
  args: {
    autoFocus: true,
  },
};

export const InputWithAutomaticResizing: Story = {
  args: {
    automaticResize: true,
    defaultValue: 'This input should automatically resize based on the content',
    // Add an action to test whether resizing works correctly with additional UI
    actions: <Input.Action icon="caret-down" label="Open menu" onPress={() => { notify.info('Clicked'); }}/>,
  },
};
