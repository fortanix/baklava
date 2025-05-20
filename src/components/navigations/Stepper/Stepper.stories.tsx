/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { type Step, Stepper } from './Stepper.tsx';


type StepperArgs = React.ComponentProps<typeof Stepper>;
type Story = StoryObj<StepperArgs>;

export default {
  component: Stepper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {},
  render: (args) => <Stepper {...args}/>,
} satisfies Meta<StepperArgs>;

const defaultSteps: Array<Step> = [1,2,3,4].map(index => { 
  return {
    stepKey: `${index}`,
    title: `Step ${index}`,
    isOptional: index === 4,
  };
});

type StepperWithTriggerProps = React.PropsWithChildren<Partial<StepperArgs>>;
const StepperWithTrigger = (props: StepperWithTriggerProps) => {
  const { steps = defaultSteps, activeKey, ...stepperContext } = props;
  const [activeStepKey, setActiveStepKey] = React.useState<string>(activeKey || '1');
  return (
    <Stepper
      onSwitch={setActiveStepKey}
      activeKey={activeStepKey}
      steps={steps}
      {...stepperContext}
    />
  );
};

const BaseStory: Story = {
  args: {},
  render: (args) => <StepperWithTrigger {...args} />,
};

export const StepperStandard: Story = {
  ...BaseStory,
  args: { ...BaseStory.args },
};

/** A step may be disabled. In this case, it will not be clickable. */
export const StepperWithDisabledStep: Story = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    steps: [
      { stepKey: '1', title: 'Step 1', isDisabled: false },
      { stepKey: '2', title: 'Step 2', isDisabled: false },
      { stepKey: '3', title: 'Step 3 (disabled)', isDisabled: true },
      { stepKey: '4', title: 'Step 4', isDisabled: false },
    ],
  },
};

export const StepperHorizontal: Story = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    direction: 'horizontal',
  },
};
