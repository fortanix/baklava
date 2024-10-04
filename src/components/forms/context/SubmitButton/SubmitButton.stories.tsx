/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { delay } from '../../../../util/time.ts';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Alert } from '../../../containers/Alert/Alert.tsx';
import { Form } from '../Form/Form.tsx';
import { InputField } from '../../fields/InputField/InputField.tsx';
import { FormLayout } from '../../../../layouts/FormLayout/FormLayout.tsx';

import { SubmitButton } from './SubmitButton.tsx';


type SubmitButtonArgs = React.ComponentProps<typeof SubmitButton>;
type Story = StoryObj<typeof SubmitButton>;

const StoryMeta = {
  component: SubmitButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    unstyled: false,
    label: 'Submit',
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
            <p><SubmitButton variant="tertiary" label="Reset" onClick={resetErrorBoundary}/></p>
          </Alert>
        }
      >
        <Form nestable>
          <Story/>
        </Form>
      </ErrorBoundary>
    ),
  ],
} satisfies Meta<SubmitButtonArgs>;
export default StoryMeta;


export const Standard: Story = {};

export const AsyncSubmitButton: Story = {
  args: {
    ...StoryMeta.args,
    label: 'Trigger async action',
    async onPress() {
      await delay(1000);
      console.log('Done!');
    },
  },
};

// Note: an infinite `onPress` will cause all React transition to get stuck, due to batching behavior.
// Adding a timeout prevents the rest of the application getting stuck.
export const AsyncSubmitButtonInfinite: Story = {
  ...AsyncSubmitButton,
  name: 'Async SubmitButton [timeout]',
  args: {
    ...StoryMeta.args,
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

export const AsyncSubmitButtonFailure: Story = {
  ...AsyncSubmitButton,
  name: 'Async SubmitButton [failure]',
  args: {
    ...StoryMeta.args,
    label: 'Trigger failure',
    async onPress() {
      await delay(1000);
      await new Promise((_, reject) => { reject(new Error('Something went wrong')); });
    },
  },
};

const FormWithAction = (props: React.ComponentPropsWithRef<'form'>) => {
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
export const FormActionSubmitButton: Story = {
  args: {
    ...StoryMeta.args,
    label: 'Submit form',
    onPress: undefined,
  },
  render: (args) => (
    <FormWithAction>
      <FormLayout>
        <InputField data-label="name" label="Name" name="name"/>
        <SubmitButton {...args}/>
      </FormLayout>
    </FormWithAction>
  ),
};
