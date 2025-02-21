/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { loremIpsumSentence } from '../../../../util/storybook/LoremIpsum.tsx';

import { Form } from '../../context/Form/Form.tsx';
import { Card } from '../../../containers/Card/Card.tsx';

import { InputFieldWithTags } from './InputFieldWithTags.tsx';


type InputFieldWithTagsArgs = React.ComponentProps<typeof InputFieldWithTags>;
type Story = StoryObj<InputFieldWithTagsArgs>;

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
    Story => (
      <Form>
        <Card style={{ inlineSize: 350 }}>
          <Story/>
        </Card>
      </Form>
    ),
  ],
} satisfies Meta<InputFieldWithTagsArgs>;

const InputFieldWithTagsControlled = (props: InputFieldWithTagsArgs) => {
  const [tags, setTags] = React.useState<Array<string>>(props.tags ?? []);
  const [inputText, setInputText] = React.useState<string>('');
  
  const handleUpdate = (newInputText: string) => {
    setInputText(newInputText);
  };
  const handleUpdateTags = (newTags: string[]) => {
    setTags(newTags);
  };
  
  return (
    <InputFieldWithTags
      tags={tags}
      value={inputText}
      label="Input with tags"
      onUpdate={handleUpdate}
      onUpdateTags={handleUpdateTags}
      placeholder="Placeholder"
    />
  );
};

export const InputWithTags: Story = {
  render: () => <InputFieldWithTagsControlled tags={['Tag 1', 'Tag 2']}/>,
};

/** Test that the component renders properly if there is a tag with a lot of content that can cause overflow. */
export const InputWithTagsWithLongTag: Story = {
  render: () => <InputFieldWithTagsControlled tags={['Tag 1', 'Tag 2', loremIpsumSentence]}/>,
};
