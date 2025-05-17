/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { H1 } from '../../typography/Heading/Heading.tsx';
import { Icon } from '../../components/graphics/Icon/Icon.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { InputSensitive } from '../../components/forms/controls/Input/InputSensitive.tsx';
import { InputField } from '../../components/forms/fields/InputField/InputField.tsx';
import { SubmitButton } from '../../components/forms/context/SubmitButton/SubmitButton.tsx';
import { Form } from '../../components/forms/context/Form/Form.tsx';
import { FormLayout } from '../FormLayout/FormLayout.tsx';

import { PublicLayout } from './PublicLayout.tsx';


type PublicLayoutArgs = React.ComponentProps<typeof PublicLayout>;
type Story = StoryObj<PublicLayoutArgs>;

export default {
  component: PublicLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => <div style={{ display: 'grid' }}><Story/></div>
  ],
  argTypes: {},
  args: {
  },
  render: (args) => <PublicLayout {...args}/>,
} satisfies Meta<PublicLayoutArgs>;


export const PublicLayoutStandard: Story = {
  args: {
    heading: (
      <PublicLayout.Heading>
        <H1>Login</H1>
        <PublicLayout.FortanixArmorLogo stacked={false}/>
      </PublicLayout.Heading>
    ),
    children: (
      <Form>
        <FormLayout>
          <InputField label="Username" placeholder="email@example.com"/>
          <InputField Input={InputSensitive} label="Password"/>
          <Link href="" style={{ alignSelf: 'end', marginTop: '-0.8lh' }}>Forgot your password?</Link>
          
          <SubmitButton label="Log in"/>
          <Button kind="tertiary" onPress={() => {}} style={{ marginTop: '-0.8lh' }}>Log in with SSO</Button>
          <Button kind="tertiary" onPress={() => {}}>Don't have an account? Sign up</Button>
        </FormLayout>
      </Form>
    ),
    productInfoCards: (
      <>
        <PublicLayout.ProductInfoCard>
          <PublicLayout.ProductInfoCard.Heading>
            <Icon icon="demo" aria-label="Discover"/>
            Discover
          </PublicLayout.ProductInfoCard.Heading>
          <ul>
            <li>
              Reveal your cryptographic security posture to mitigate data exposure risks across multi-cloud environments.
            </li>
          </ul>
        </PublicLayout.ProductInfoCard>
        <PublicLayout.ProductInfoCard>
          <PublicLayout.ProductInfoCard.Heading>
            <Icon icon="badge-assessment" aria-label="Assess"/>
            Assess
          </PublicLayout.ProductInfoCard.Heading>
          <ul>
            <li>Gain data-driven insights into the most pressing data security and compliance risks.</li>
            <li>Validate alignment with security policies and prioritize remediation steps.</li>
          </ul>
        </PublicLayout.ProductInfoCard>
        <PublicLayout.ProductInfoCard>
          <PublicLayout.ProductInfoCard.Heading>
            <Icon icon="security-object" aria-label="Remediate"/>
            Remediate
          </PublicLayout.ProductInfoCard.Heading>
          <ul>
            <li>Improve your cryptographic security posture faster and at scale for continuous compliance.</li>
          </ul>
        </PublicLayout.ProductInfoCard>
      </>
    ),
  },
};
