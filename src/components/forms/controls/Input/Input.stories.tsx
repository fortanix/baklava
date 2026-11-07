/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  render: (args) => <Input {...args}/>,
} satisfies Meta<InputArgs>;


export const InputStandard: Story = {};

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
    pattern: String.raw`\d+`,
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

const CustomIcon: React.ComponentProps<typeof Input>['Icon'] = props => '🍕';
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

/**
 * Test that `onFocus` and `onBlur` are properly handled, such that:
 * - Focusing the inner input triggers focus/blur.
 * - Focusing any other interactive elements in the input (like actions) also trigger focus/blur.
 */
export const InputWithFocusTracking: Story = {
  decorators: [
    (_, { args }) => {
      const [isFocused, setIsFocused] = React.useState(false);
      return (
        <>
          <Input
            {...args}
            onFocus={() => { setIsFocused(true); }}
            onBlur={() => { setIsFocused(false); }}
          />
          <p>Focused: {isFocused ? 'yes' : 'no'}</p>
        </>
      );
    },
  ],
  args: {
    actions: <Input.Action icon="caret-down" label="Open menu" onPress={() => { notify.info('Clicked'); }}/>,
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

/** The `id` prop should be applied to the inner `<input>`. */
export const InputWithId: Story = {
  args: { id: 'test-id' },
};

const InputInFormC = (props: InputArgs) => {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify.info(`You have submitted: ${new FormData(event.currentTarget).get('story-input') ?? '(none)'}`);
  };
  return (
    <form onSubmit={handleSubmit}>
      <p><Input {...props} name="story-input" defaultValue="Some value"/></p>
      <p><button type="submit">Submit</button></p>
    </form>
  );
};
export const InputInForm: Story = {
  render: args => <InputInFormC {...args}/>,
};


const InputInFormWithIdC = (props: InputArgs) => {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify.info(`You have submitted: ${new FormData(event.currentTarget).get('story-input') ?? '(none)'}`);
  };
  return (
    <>
      <form id="story-form" onSubmit={handleSubmit}/>
      <p><Input {...props} form="story-form" name="story-input" defaultValue="Some value"/></p>
      <p><button form="story-form" type="submit">Submit</button></p>
    </>
  );
};
export const InputInFormWithId: Story = {
  render: args => <InputInFormWithIdC {...args}/>,
};

const InputInFormWithCustomValueC = (props: InputArgs) => {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify.info(`You have submitted: ${new FormData(event.currentTarget).get('story-input') ?? '(none)'}`);
  };
  return (
    <>
      <form id="story-form" onSubmit={handleSubmit}/>
      <p><Input {...props} form="story-form" name="story-input" defaultValue="Some value" formValue="custom"/></p>
      <p><button form="story-form" type="submit">Submit</button></p>
    </>
  );
};
export const InputInFormWithCustomValue: Story = {
  render: args => <InputInFormWithCustomValueC {...args}/>,
};

const InputInFormWithCustomValueArrayC = (props: InputArgs) => {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget).getAll('story-input[]');
    notify.info(`You have submitted: ${values.join(', ') || '(none)'}`);
  };
  return (
    <>
      <form id="story-form" onSubmit={handleSubmit}/>
      <p>
        <Input {...props} form="story-form" name="story-input" defaultValue="Some value"
          formValue={['custom1', 'custom2']}
        />
      </p>
      <p><button form="story-form" type="submit">Submit</button></p>
    </>
  );
};
export const InputInFormWithCustomValueArray: Story = {
  render: args => <InputInFormWithCustomValueArrayC {...args}/>,
};
