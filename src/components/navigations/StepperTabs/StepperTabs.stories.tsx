/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { StepperTabs } from './StepperTabs.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';

type StepperTabsArgs = React.ComponentProps<typeof StepperTabs>;
type Story = StoryObj<StepperTabsArgs>;

export default {
  component: StepperTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    children: (
      <>
        <StepperTabs.List>
          <StepperTabs.Trigger
            tabKey="step_1"
            title="Step 1"
            indicator={<Icon icon="caret-right" />}
            description={`
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since 1966
            `}
          />
          <StepperTabs.Trigger
            tabKey="step_2"
            title="Step 2"
            indicator={<Icon icon="caret-right" />}
            description={`
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since 1966
            `}
          />
          <StepperTabs.Trigger
            tabKey="step_3"
            title="Step 3"
            indicator={<Icon icon="caret-right" />}
            description={`
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since 1966
            `}
          />
        </StepperTabs.List>
        <StepperTabs.Body>
          <StepperTabs.Content tabKey="step_1">
            Content 1
          </StepperTabs.Content>
          <StepperTabs.Content tabKey="step_2">
            Content 2
          </StepperTabs.Content>
          <StepperTabs.Content tabKey="step_3">
            Content 3
          </StepperTabs.Content>
        </StepperTabs.Body>
      </>
    ),
  },
  render: args => {
    const [selectedStep, setSelectedStep] = React.useState('step_1');

    const steps = ['step_1', 'step_2', 'step_3'];
    const currentIndex = steps.indexOf(selectedStep);

    return (
      <div>
        <StepperTabs
          {...args}
          selected={selectedStep}
          onSelectedChange={selected => setSelectedStep(selected ?? '')}
        />

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Button
            kind="secondary"
            disabled={currentIndex === 0}
            onPress={() => setSelectedStep(steps[currentIndex - 1] ?? '')}
          >
            Back
          </Button>

          <Button
            kind="primary"
            disabled={currentIndex === steps.length - 1}
            onPress={() => setSelectedStep(steps[currentIndex + 1] ?? '')}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
} satisfies Meta<StepperTabsArgs>;


export const StepperTabsStandard: Story = {};
