/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { type ItemKey, SolutionSelector } from './SolutionSelector.tsx';


type SolutionSelectorArgs = React.ComponentProps<typeof SolutionSelector>;
type Story = StoryObj<SolutionSelectorArgs>;

export default {
  component: SolutionSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <SolutionSelector {...args}/>,
} satisfies Meta<SolutionSelectorArgs>;


const formatSolution = (solutionKey: string) => solutionKey.replace('solution_', 'Solution ');

export const SolutionSelectorStandard: Story = {
  args: {
    solutions: (
      <>
        {Array.from({ length: 5 }).map((_, index) =>
          <SolutionSelector.Option
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is fine for the purpose of this story
            key={`solution_${index + 1}`}
            itemKey={`solution_${index + 1}`}
            icon="badge-assessment"
            label={`Solution ${index + 1}`}
          />
        )}
      </>
    ),
    children: selectedSolution => selectedSolution === null ? 'Solutions' : formatSolution(selectedSolution),
  },
};

const SolutionSelectorControlledC = () => {
  const [selected, setSelected] = React.useState<null | ItemKey>('solution_2');
  
  return (
    <SolutionSelector
      selected={selected}
      onSelectedChange={setSelected}
      solutions={
        Array.from({ length: 30 }, (_, index) => `Solution ${index + 1}`).map((name, index) =>
          <SolutionSelector.Option
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is fine for the purpose of this story
            key={`solution_${index + 1}`}
            itemKey={`solution_${index + 1}`}
            icon="badge-assessment"
            label={name}
          />
        )
      }
    >
      {selectedSolution => selectedSolution === null ? 'Solutions' : formatSolution(selectedSolution)}
    </SolutionSelector>
  );
};
export const SolutionSelectorControlled: Story = {
  render: args => <SolutionSelectorControlledC {...args}/>,
};
