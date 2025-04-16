/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsum, LoremIpsum, loremIpsumSentence } from '../../../util/storybook/LoremIpsum.tsx';
import { Form } from '../../forms/context/Form/Form.tsx';
import { FormLayout } from '../../../layouts/FormLayout/FormLayout.tsx';
import { RadioGroup } from '../../forms/controls/RadioGroup/RadioGroup.tsx';
import { FieldLayout } from '../../forms/fields/FieldLayout/FieldLayout.tsx';
import { InputField } from '../../forms/fields/InputField/InputField.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';

import { Dialog } from './Dialog.tsx';


type DialogArgs = React.ComponentProps<typeof Dialog>;
type Story = StoryObj<DialogArgs>;

export default {
  tags: ['autodocs'],
  component: Dialog,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => <LayoutDecorator size="large" style={{ maxHeight: '20lh' }}><Story/></LayoutDecorator>,
  ],
  args: {
    title: 'Dialog title',
    children: <LoremIpsum paragraphs={3}/>,
    actions: <Dialog.SubmitAction/>,
    onRequestClose: () => {},
  },
} satisfies Meta<DialogArgs>;


export const DialogStandard: Story = {};

export const DialogWithoutClose: Story = {
  args: {
    showCloseIcon: false,
  },
};

export const DialogWithFocus: Story = {
  args: {
    className: 'pseudo-focus-visible',
  },
};

export const DialogWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
  },
};

export const DialogFlat: Story = {
  args: {
    flat: true,
  },
};

export const DialogWithAside: Story = {
  render: () => {
    const radioOptions = ['Response Only', 'Query Only', 'All'] as const;
    const [selectedRadioOption, setSelectedRadioOption] = React.useState<string>('Response Only');
    return (
      <Dialog
        title="Dialog Pattern 1"
        actions={<Dialog.SubmitAction/>}
        iconAside={<Icon.Event event="warning"/>}
      >
        <p>{loremIpsumSentence}</p>
        <p>{loremIpsumSentence.slice(0, 55)}.</p>
        <Form>
          <FormLayout>
            <RadioGroup
              orientation="horizontal"
              label="Label"
              selected={selectedRadioOption}
              onUpdate={radioKey => { setSelectedRadioOption(radioKey); }}
            >
              {radioOptions.map(radioOption =>
                <RadioGroup.Button
                  key={radioOption}
                  radioKey={radioOption}
                  label={radioOption}
                />
              )}
            </RadioGroup>
            <FieldLayout size="small">
              <InputField placeholder="Placeholder" />
            </FieldLayout>
          </FormLayout>
        </Form>
      </Dialog>
    );
  },
};
