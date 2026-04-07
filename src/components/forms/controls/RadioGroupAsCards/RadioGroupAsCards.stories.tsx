/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { CardKey, RadioGroupAsCards } from './RadioGroupAsCards.tsx';

type RadioGroupAsCardsArgs = React.ComponentProps<typeof RadioGroupAsCards>;
type Story = StoryObj<RadioGroupAsCardsArgs>;

export default {
  component: RadioGroupAsCards,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      table: { disable: true },
      control: false,
    },
  },
  args: {
    'aria-label': 'Choose a color',
    onUpdate: selected => { console.log('update', selected); },
    defaultSelected: 'red',
    children: (
      <>
        <RadioGroupAsCards.Card
          key="red"
          icon={<Icon icon="account" />}
          cardKey="red"
          title="On Prem"
        />
        <RadioGroupAsCards.Card
          key="eks"
          icon={<Icon icon="account" />}
          cardKey="eks"
          title="External Key Source Connection"
        />
        <RadioGroupAsCards.Card key="aws" icon={<Icon icon="account" />} cardKey="aws" title="Amazon Web Services" />
        <RadioGroupAsCards.Card key="azure" icon={<Icon icon="account" />} cardKey="azure" title="Azure" />
      </>
    ),
  },
  render: (args) => <RadioGroupAsCards {...args} />,
} satisfies Meta<RadioGroupAsCardsArgs>;


export const RadioGroupAsCardsStandard: Story = {};

export const RadioGroupAsCardsWithoutIcon: Story = {
  args: {
    children: (
      <>
        <RadioGroupAsCards.Card
          cardKey="red"
          title="Red"
        />
        <RadioGroupAsCards.Card cardKey="green" title="Green" />
        <RadioGroupAsCards.Card cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const RadioGroupAsCardsHover: Story = {
  args: {
    children: (
      <>
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="red" title="Red" />
        <RadioGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green (Hovered)"
          className="pseudo-hover"
        />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const RadioGroupAsCardsFocused: Story = {
  args: {
    children: (
      <>
        <RadioGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red (Focused)"
          className="pseudo-focus-visible"
        />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="green" title="Green" />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="blue" title="Blue" />
      </>
    ),
  },
};


type RadioGroupAsCardsControlledProps = Omit<React.ComponentProps<typeof RadioGroupAsCards>, 'selected'>;
const RadioGroupAsCardsControlledC = (props: RadioGroupAsCardsControlledProps) => {
  const [selectedButton, setSelectedButton] = React.useState<undefined | CardKey>(props.defaultSelected ?? undefined);

  return (
    <>
      <p>Selected color: {selectedButton ?? <em>none</em>}</p>
      <RadioGroupAsCards {...props} selected={selectedButton} onUpdate={setSelectedButton} />
      <Button label="Update state" onPress={() => { setSelectedButton('blue'); }} />
    </>
  );
};

export const RadioGroupAsCardsControlled: Story = {
  render: args => <RadioGroupAsCardsControlledC {...args} />,
  args: {
    children: (
      <>
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="red" title="Red" />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="green" title="Green" />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const RadioGroupAsCardsControlledWithDefault: Story = {
  render: args => <RadioGroupAsCardsControlledC {...args} defaultSelected="green" />,
  args: {
    children: (
      <>
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="red" title="Red" />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="green" title="Green" />
        <RadioGroupAsCards.Card icon={<Icon icon="account" />} cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const RadioGroupAsCardsInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            notify.info(`You have chosen: ${new FormData(event.currentTarget).get('story_component1') || 'none'}`);
          }}
        />
        <Story />
        <button type="submit" form="story-form">Submit</button>
      </>
    ),
  ],

  args: {
    inputProps: {
      form: 'story-form',
      name: 'story_component1', 
    },
    children: (
      <>
        <RadioGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <RadioGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <RadioGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};
