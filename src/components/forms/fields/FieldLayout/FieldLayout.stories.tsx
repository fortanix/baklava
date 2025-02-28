/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldLayout } from './FieldLayout.tsx';
import { Card } from '../../../containers/Card/Card.tsx';
import { Input } from '../../controls/Input/Input.tsx';
import { LoremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';


type FieldLayoutArgs = React.ComponentProps<typeof FieldLayout>;
type Story = StoryObj<FieldLayoutArgs>;

export default {
  component: FieldLayout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: (args) => {
    return (
      <Card>
        <LoremIpsum paragraphs={1}/>
        <FieldLayout size="small">
          <Input value="Small text input" />
        </FieldLayout>
      </Card>
    );
  },
} satisfies Meta<FieldLayoutArgs>;

export const FieldLayoutSmall: Story = {};
