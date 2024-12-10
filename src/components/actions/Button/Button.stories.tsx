/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { delay } from '../../../util/time.ts';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Alert } from '../../containers/Alert/Alert.tsx';

import { Button } from './Button.tsx';


type ButtonArgs = React.ComponentProps<typeof Button>;
type Story = StoryObj<typeof Button>;

export default {
  component: Button,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FnOF5w9LfPiJabQD5yPzCEp%2F2024-Design-System-UX%3Fnode-id%3D327%253A6150%26t%3DjsTF1ykn6P4yp2et-1' },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    label: 'Button',
    variant: 'primary',
    nonactive: false,
    disabled: false,
    onPress() {
      alert('Click');
    },
  },
  decorators: [
    Story => (
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) =>
          <Alert kind="error" style={{ width: '80cqi' }}>
            <p>Error: {error?.message}</p>
            <p><Button variant="tertiary" label="Reset" onClick={resetErrorBoundary}/></p>
          </Alert>
        }
      >
        <Story/>
      </ErrorBoundary>
    ),
  ],
} satisfies Meta<ButtonArgs>;


const BaseStory: Story = {
  args: {},
  render: (args) => <Button {...args}/>,
};

const PrimaryStory: Story = {
  ...BaseStory,
  args: { ...BaseStory.args, variant: 'primary' },
};

export const PrimaryStandard: Story = {
  ...PrimaryStory,
  name: 'Primary [standard]',
};

export const PrimaryHover: Story = {
  ...PrimaryStory,
  name: 'Primary [hover]',
  args: { ...PrimaryStory.args, className: 'pseudo-hover' },
};

export const PrimaryFocus: Story = {
  ...PrimaryStory,
  name: 'Primary [focus]',
  args: { ...PrimaryStory.args, className: 'pseudo-focus-visible' },
};

export const PrimaryNonactive: Story = {
  ...PrimaryStory,
  name: 'Primary [nonactive]',
  args: { ...PrimaryStory.args, nonactive: true },
};

export const PrimaryDisabled: Story = {
  ...PrimaryStory,
  name: 'Primary [disabled]',
  args: { ...PrimaryStory.args, disabled: true },
};

export const Secondary: Story = {
  ...BaseStory,
  name: 'Secondary [standard]',
  args: { ...BaseStory.args, variant: 'secondary' },
};

export const SecondaryHover: Story = {
  ...Secondary,
  name: 'Secondary [hover]',
  args: { ...Secondary.args, className: 'pseudo-hover' },
};

export const SecondaryFocus: Story = {
  ...Secondary,
  name: 'Secondary [focus]',
  args: { ...Secondary.args, className: 'pseudo-focus-visible' },
};

export const SecondaryNonactive: Story = {
  ...Secondary,
  name: 'Secondary [nonactive]',
  args: { ...Secondary.args, nonactive: true },
};

export const SecondaryDisabled: Story = {
  ...Secondary,
  name: 'Secondary [disabled]',
  args: { ...Secondary.args, disabled: true },
};

export const Tertiary: Story = {
  ...BaseStory,
  name: 'Tertiary [standard]',
  args: { ...BaseStory.args, variant: 'tertiary' },
};

export const TertiaryHover: Story = {
  ...Tertiary,
  name: 'Tertiary [hover]',
  args: { ...Tertiary.args, className: 'pseudo-hover' },
};

export const TertiaryFocus: Story = {
  ...Tertiary,
  name: 'Tertiary [focus]',
  args: { ...Tertiary.args, className: 'pseudo-focus-visible' },
};

export const TertiaryNonactive: Story = {
  ...Tertiary,
  name: 'Tertiary [nonactive]',
  args: { ...Tertiary.args, nonactive: true },
};

export const TertiaryDisabled: Story = {
  ...Tertiary,
  name: 'Tertiary [disabled]',
  args: { ...Tertiary.args, disabled: true },
};

export const AsyncButton: Story = {
  ...PrimaryStory,
  args: {
    ...PrimaryStory.args,
    label: 'Trigger async action',
    async onPress() {
      await delay(1000);
      console.log('Done!');
    },
  },
};

// Note: an infinite `onPress` will cause all React transition to get stuck, due to batching behavior.
// Adding a timeout prevents the rest of the application getting stuck.
export const AsyncButtonInfinite: Story = {
  ...AsyncButton,
  name: 'Async Button [timeout]',
  args: {
    ...PrimaryStory.args,
    label: 'Infinitely pending...',
    async onPress() {
      await new Promise(() => {}); // Infinite wait
    },
    asyncTimeout: 5000,
  },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};

export const AsyncButtonFailure: Story = {
  ...AsyncButton,
  name: 'Async Button [failure]',
  args: {
    ...PrimaryStory.args,
    label: 'Trigger failure',
    async onPress() {
      await delay(1000);
      await new Promise((_, reject) => { reject(new Error('Something went wrong')); });
    },
  },
};

const Form = (props: React.ComponentPropsWithRef<'form'>) => {
  const [error, submitAction, isPending] = React.useActionState(
    async (previousState: unknown, formData: FormData) => {
      const delay = (timeMs: number) => new Promise(resolve => window.setTimeout(resolve, timeMs));
      await delay(2000);
      //console.log([...formData.keys()]);
      return null;
    },
    null,
  );
  
  return <form action={submitAction} {...props}/>;
};
export const FormActionButton: Story = {
  ...PrimaryStory,
  args: {
    ...PrimaryStory.args,
    label: 'Submit form',
    onPress: undefined,
  },
  render: (args) => (
    <Form>
      <label>Name: <input type="text" name="name"/></label>
      <Button {...args}/>
    </Form>
  ),
};

export const CustomContent: Story = {
  ...PrimaryStory,
  args: {
    ...PrimaryStory.args,
    children: (
      <span style={{ textDecoration: 'underline' }}>
        Custom content
      </span>
    ),
  },
};

export const CustomContentWithIconBefore: Story = {
  ...PrimaryStory,
  name: 'Custom Content – With icon (before)',
  args: {
    ...PrimaryStory.args,
    children: <>
      <Icon icon="status-success" className="icon"/>
      Button with icon
    </>,
  },
};

export const CustomContentWithIconAfter: Story = {
  ...PrimaryStory,
  name: 'Custom Content – With icon (after)',
  args: {
    ...PrimaryStory.args,
    children: <>
      Button with icon
      <Icon icon="caret-down" className="icon"/>
    </>,
  },
};
