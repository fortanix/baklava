
import * as React from 'react';
import { mergeProps } from '../../util/reactUtil.ts';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../actions/Button/Button.tsx';

import { type ItemKey, useCompoundListItem, useCompoundList } from './CompoundList.tsx';


type ListItemProps = React.ComponentProps<typeof Button> & { itemKey: ItemKey };
const ListItem = ({ itemKey, ...propsRest }: ListItemProps) => {
  const itemProps = useCompoundListItem({ itemKey });
  return (
    <Button {...mergeProps(propsRest, itemProps)}/>
  );
};
const List = ({ children }: React.PropsWithChildren) => {
  const { Provider: CompoundListProvider, props } = useCompoundList<HTMLDivElement>();
  return (
    <CompoundListProvider>
      <div {...props}>
        <style>{`
          @scope {
            display: flex;
            flex-direction: column;
          }
        `}</style>
        {children}
      </div>
    </CompoundListProvider>
  );
};

type ListArgs = React.ComponentProps<typeof List>;
type Story = StoryObj<ListArgs>;

export default {
  title: 'components/Composite/CompoundList',
  component: List,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => <List {...args}/>,
  decorators: [
    Story => (
      <div>
        <style>{`
          @scope {
            
          }
        `}</style>
        <Story/>
      </div>
    ),
  ],
} satisfies Meta<ListArgs>;


export const CompoundListStandard: Story = {
  args: {
    children: (
      <>
        <ListItem itemKey="item-1">Item 1</ListItem>
        <ListItem itemKey="item-2">Item 2</ListItem>
        <ListItem itemKey="item-3">Item 3</ListItem>
      </>
    ),
  },
};
