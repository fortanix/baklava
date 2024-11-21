/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { Form } from '../../context/Form/Form.tsx';
import { Card } from '../../../containers/Card/Card.tsx';

import { InputFieldWithTags } from './InputFieldWithTags.tsx';


type InputArgs = React.ComponentProps<typeof InputFieldWithTags>;
type Story = StoryObj<InputArgs>;

export default {
  component: InputFieldWithTags,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ymWCnsGfIsC2zCz17Ur11Z/Design-System-UX?node-id=3606-101183&node-type=instance&m=dev',
    }
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    label: 'Test',
    placeholder: 'Example',
  },
  decorators: [
    Story => <Form><Story/></Form>,
  ],
} satisfies Meta<InputArgs>;

export const InputWithTags: Story = {
  name: 'Input with tags (enter creates new tag, backspace erases tags)',
  render: () => {
    const [tags, setTags] = React.useState<Array<string>>(['Tag Title', 'Tag Title 2']);
    const [inputText, setInputText] = React.useState<string>('Example');

    const handleUpdate = (newInputText: string) => {
      setInputText(newInputText);
    };
    const handleUpdateTags = (newTags: string[]) => {
      setTags(newTags);
    };

    return (
      <Card>
        <InputFieldWithTags
          tags={tags}
          value={inputText}
          onUpdate={handleUpdate}
          onUpdateTags={handleUpdateTags}
          placeholder=""
        />
      </Card>
    );
  }
};
