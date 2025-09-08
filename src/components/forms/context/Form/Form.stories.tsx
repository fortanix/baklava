/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';
//import { useFormStatus } from 'react-dom';

import { Panel } from '../../../containers/Panel/Panel.tsx';
import { InputField } from '../../fields/InputField/InputField.tsx';
import { SubmitButton } from '../SubmitButton/SubmitButton.tsx';
import { FormLayout } from '../../../../layouts/FormLayout/FormLayout.tsx';

import { /*useFormContext,*/ Form } from './Form.tsx';


type FormArgs = React.ComponentProps<typeof Form>;
type Story = StoryObj<FormArgs>;

const FormWithState = (props: React.ComponentProps<typeof Form>) => {
  const action = async (previousState: unknown, formData: FormData): Promise<null> => {
    if (typeof props.action === 'function') {
      await props.action?.(formData);
      return null;
    }
    return null;
  };
  
  const [state, formAction] = React.useActionState(action, null);
  
  // const formDataCached = React.useRef<null | FormData>(null);
  // React.useEffect(() => {
  //   if (formStatus.data !== null) {
  //     formDataCached.current = formStatus.data;
  //   }
  // }, [formStatus.data]);
  
  return (
    <Form {...props} action={formAction}>
      {state &&
        <Panel className="bk-prose">
          Submitted data:
          {' '}
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Panel>
      }
      {props.children}
    </Form>
  );
};

export default {
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: 'Example',
  },
  render: (args) => (
    <FormWithState {...args}>
      <FormLayout>
        {args.children}
      </FormLayout>
    </FormWithState>
  ),
} satisfies Meta<FormArgs>;


export const Standard: Story = {
  name: 'Form',
  args: {
    //nestable: true,
    //onSubmit: (event) => { event.preventDefault(); console.log('submit', event); },
    action: (formData) => {
      //console.log('action', formData.get('field-1'));
      const result = [...formData.entries()].reduce(
        (acc, [fieldKey, field]) => {
          if (Object.hasOwn(acc, fieldKey)) {
            console.warn(`Found duplicate entries for key ${fieldKey}`);
          }
          acc[fieldKey] = field;
          return acc;
        },
        {} as Record<string, unknown>,
      );
      return; // FIXME: form actions now return type `void | Promise<void>`
    },
    children: (
      <>
        <InputField label="Field 1" name="field-1" placeholder="Example"/>
        <InputField label="Field 2" name="field-2" placeholder="Example"/>
        <SubmitButton/>
      </>
    ),
  },
};
