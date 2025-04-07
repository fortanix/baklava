/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from '../../components/containers/Dialog/Dialog.tsx';
import { Logo } from '../../layouts/AppLayout/Logo/Logo.tsx';
import { H3 } from '../../typography/Heading/Heading.tsx';
import { Form } from '../../components/forms/context/Form/Form.tsx';
import { FormLayout } from '../FormLayout/FormLayout.tsx';
import { CheckboxGroup } from '../../components/forms/controls/CheckboxGroup/CheckboxGroup.tsx';
import { InputField } from '../../components/forms/fields/InputField/InputField.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { Stepper } from '../../components/navigations/Stepper/Stepper.tsx';
import { Icon } from '../../components/graphics/Icon/Icon.tsx';
import { FieldLayout } from '../../components/forms/fields/FieldLayout/FieldLayout.tsx';

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


export const DialogOnboarding: Story = {
  render: () => {
    return (
      <Dialog
        // TODO: Replace here after https://github.com/fortanix/baklava/issues/163
        title={<Logo subtitle="Armor"/>}
        showCancelAction={false}
        onRequestClose={() => console.log('close')}
      >
        <DialogLayout
          title="Let's Connect to Your Cloud Provider"
          aside={(
            <>
              <Stepper
                steps={[
                  { stepKey: '1', title: 'Select Cloud Provider' },
                  { stepKey: '2', title: 'Setup Cloud Connection' },
                  { stepKey: '3', title: 'Set Up Subscriptions' },
                  { stepKey: '4', title: '4th Option Title' },
                ]}
                activeKey="1"
                onSwitch={() => {}}
              />
              {/* TODO: Maybe this should be a separate component? */}
              <hr/>
              <div style={{display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'flex-start'}}>
                <p><Icon icon="info"/></p>
                <p><small>Step-by-Step Guide to Connect to Azure Cloud Provider</small></p>
              </div>
            </>
          )}
        >
          <H3>Connect to Azure Subscriptions</H3>

          <Form>
            <FormLayout>
              <p>Key Insight has read-only access to resources within your AWS account.</p>

              <FieldLayout size="medium">
                <InputField
                  label="Azure account name"
                  labelTooltip="Lorem ipsum"
                  placeholder="Placeholder"
                  description="Account name must be unique within the global namespace"
                />
              </FieldLayout>

              <CheckboxGroup label="Select your account type">
                <CheckboxGroup.Checkbox checkboxKey="m" label="Management groups"/>
                <CheckboxGroup.Checkbox checkboxKey="s" label="Subscriptions"/>
              </CheckboxGroup>

              <FieldLayout size="medium">
                <InputField
                  label="Management group ID"
                  labelTooltip="Lorem ipsum"
                  placeholder="Placeholder"
                />
              </FieldLayout>

              <FieldLayout size="medium">
                <InputField
                  label="Client ID"
                  labelTooltip="Lorem ipsum"
                  placeholder="Placeholder"
                />
              </FieldLayout>

              <FieldLayout size="medium">
                <InputField
                  label="Client secret"
                  labelTooltip="Lorem ipsum"
                  placeholder="Placeholder"
                />
              </FieldLayout>

              <FieldLayout size="medium">
                <InputField
                  label="Tenant ID"
                  labelTooltip="Lorem ipsum"
                  placeholder="Placeholder"
                />
              </FieldLayout>

              {/* TODO: Eventually in the future implement something like this:
              https://react-spectrum.adobe.com/react-spectrum/Flex.html */}
              <div style={{display: 'flex', flexDirection: 'row', gap: '12px'}}>{/* bk.spacing-3 */}
                <Dialog.CancelAction kind="secondary">Close</Dialog.CancelAction>
                <Button kind="secondary">Back</Button>
                <Button kind="secondary">Skip Onboarding</Button>
                <Button kind="primary">Next</Button>
              </div>
            </FormLayout>
          </Form>
        </DialogLayout>
      </Dialog>
    );
  },
};
