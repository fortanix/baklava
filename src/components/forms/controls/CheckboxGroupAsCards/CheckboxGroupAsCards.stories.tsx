/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { CardKey, CheckboxGroupAsCards } from './CheckboxGroupAsCards.tsx';

type CheckboxGroupAsCardsArgs = React.ComponentProps<typeof CheckboxGroupAsCards>;
type Story = StoryObj<CheckboxGroupAsCardsArgs>;

export default {
  component: CheckboxGroupAsCards,
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
    label: 'Choose from options',
    onSelectedChange: selected => { console.log('update', selected); },
    defaultSelected: new Set(['red']),
    children: (
      <>
        <CheckboxGroupAsCards.Card
          key="red"
          icon={<Icon icon="account" />}
          cardKey="red"
          title="On Prem"
        />
        <CheckboxGroupAsCards.Card
          key="eks"
          icon={<Icon icon="account" />}
          cardKey="eks"
          title="External Key Source Connection"
        />
        <CheckboxGroupAsCards.Card
          key="aws"
          icon={<Icon icon="account" />}
          cardKey="aws"
          title="Amazon Web Services"
        />
        <CheckboxGroupAsCards.Card
          key="azure"
          icon={<Icon icon="account" />}
          cardKey="azure"
          title="Azure"
        />
      </>
    ),
  },
  render: (args) => <CheckboxGroupAsCards {...args} />,
} satisfies Meta<CheckboxGroupAsCardsArgs>;

export const CheckboxGroupAsCardsStandard: Story = {};

export const CheckboxGroupAsCardsWithoutIcon: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card cardKey="red" title="Red" />
        <CheckboxGroupAsCards.Card cardKey="green" title="Green" />
        <CheckboxGroupAsCards.Card cardKey="blue" title="Blue" />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsHover: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green (Hovered)"
          className="pseudo-hover"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsFocused: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red (Focused)"
          className="pseudo-focus-visible"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsDisabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsIndividualCardDisabled: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
          disabled
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

type CheckboxGroupAsCardsControlledProps = Omit<React.ComponentProps<typeof CheckboxGroupAsCards>, 'selected'>;

const CheckboxGroupAsCardsControlledC = (props: CheckboxGroupAsCardsControlledProps) => {
  const [selectedCards, setSelectedCards] = React.useState<Set<CardKey>>( () => new Set(props.defaultSelected));

  return (
    <>
      <CheckboxGroupAsCards 
      {...props} 
      label={`Choose some colors (selected: ${[...selectedCards].join(', ') || 'none'})`}
      selected={selectedCards}
      onSelectedChange={setSelectedCards}/>
      <Button
        label="Select Blue"
        onPress={() => {
          setSelectedCards(previous => {
            const next = new Set(previous);
            next.add('blue');
            return next;
          });
        }}
      />
    </>
  );
};

export const CheckboxGroupAsCardsControlled: Story = {
  render: args => <CheckboxGroupAsCardsControlledC {...args} />,
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsControlledWithDefault: Story = {
  render: args => (
    <CheckboxGroupAsCardsControlledC
      {...args}
      defaultSelected={new Set(['green', 'red'])}
    />
  ),
  args: {
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};

export const CheckboxGroupAsCardsInForm: Story = {
  decorators: [
    Story => (
      <>
        <form
          id="story-form"
          onSubmit={event => {
            event.preventDefault();
            const selectedColors = new FormData(event.currentTarget).getAll('controlledCheckboxes[]');
            notify.info(`You have chosen: ${[...selectedColors].join(', ') || 'none'}`);
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
      name: 'controlledCheckboxes[]',
    },
    defaultSelected: new Set(['red', 'blue']),
    children: (
      <>
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="red"
          title="Red"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="green"
          title="Green"
        />
        <CheckboxGroupAsCards.Card
          icon={<Icon icon="account" />}
          cardKey="blue"
          title="Blue"
        />
      </>
    ),
  },
};
