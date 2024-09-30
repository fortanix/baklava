/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { InputField } from '../../components/forms/fields/InputField/InputField.tsx';

import { Form } from '../../components/forms/context/Form/Form.tsx';
import { FormLayout } from './FormLayout.tsx';


type FormLayoutArgs = React.ComponentProps<typeof FormLayout>;
type Story = StoryObj<FormLayoutArgs>;

export default {
  component: FormLayout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: 'Example',
  },
  render: (args) => <FormLayout {...args}/>,
  decorators: [
    Story => (
      <Form>
        <Panel>
          <Panel.Heading>Form Layout Example</Panel.Heading>
          <Story/>
        </Panel>
      </Form>
    ),
  ],
} satisfies Meta<FormLayoutArgs>;


export const Standard: Story = {
  name: 'FormLayout',
  args: {
    children: (
      <>
        <InputField
          label="Field 1"
          placeholder="Example"
        />
        <InputField
          label="Field 2"
          placeholder="Example"
        />
        <InputField
          label="Field 3"
          placeholder="Example"
        />
      </>
    ),
  },
};
