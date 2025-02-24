/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from '../Dialog/Dialog';
import { Logo } from '../../../layouts/AppLayout/Logo/Logo.tsx';
import { H4 } from '../../../typography/Heading/Heading.tsx';
import { Form } from '../../forms/context/Form/Form.tsx';
import { FormLayout } from '../../../layouts/FormLayout/FormLayout.tsx';
import { CheckboxGroup } from '../../forms/controls/CheckboxGroup/CheckboxGroup.tsx';
import { InputField } from '../../forms/fields/InputField/InputField.tsx';

import { DialogLayout } from './DialogLayout';

type DialogLayoutArgs = React.ComponentProps<typeof DialogLayout>;
type Story = StoryObj<DialogLayoutArgs>;

export default {
  tags: ['autodocs'],
  component: DialogLayout,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<DialogLayoutArgs>;


export const DialogPattern2: Story = {
  render: () => {
    return (
      <Dialog
        title={<Logo subtitle="Armor"/>}
        showCancelAction={false}
      >
        <DialogLayout
          title="Let's Connect to Your Cloud Provider"
          aside={<>hello world</>}
        >
          <H4>Connect to Azure Subscriptions</H4>
          <p>Key insight has read-only access to resources within your AWS account.</p>

          <Form>
            <FormLayout>
              <InputField
                label="Azure account name"
                labelTooltip="Lorem ipsum"
                placeholder="Placeholder"
                description="Account name must be unique within the global namespace"
              />

              <CheckboxGroup label="Select your account type">
                <CheckboxGroup.Checkbox checkboxKey="m" label="Management groups"/>
                <CheckboxGroup.Checkbox checkboxKey="s" label="Subscriptions"/>
              </CheckboxGroup>

              <InputField
                label="Management group ID"
                labelTooltip="Lorem ipsum"
                placeholder="Placeholder"
              />

              <InputField
                label="Client ID"
                labelTooltip="Lorem ipsum"
                placeholder="Placeholder"
              />

              <InputField
                label="Client secret"
                labelTooltip="Lorem ipsum"
                placeholder="Placeholder"
              />

              <InputField
                label="Tenant ID"
                labelTooltip="Lorem ipsum"
                placeholder="Placeholder"
              />
            </FormLayout>
          </Form>
        </DialogLayout>
      </Dialog>
    );
  },
};
