
import * as React from 'react';
import { mergeProps } from '../../../util/reactUtil.ts';
import { useFocusGroup } from '../../../util/hooks/useFocusGroup.ts';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../actions/Button/Button.tsx';

import { type ItemKey, useCollectionItem, useCollection } from './CollectionStore.tsx';


const generateRandomId = () => Math.random().toString(36).slice(-6);

// An example `Collection` component
type CollectionItemProps = React.ComponentProps<typeof Button> & { itemKey: ItemKey };
const CollectionItem = ({ itemKey, ...propsRest }: CollectionItemProps) => {
  const { itemProps } = useCollectionItem({ itemKey });
  return (
    <Button {...mergeProps(propsRest, itemProps, { className: 'story-collection-item' })} icon="file"/>
  );
};
const Collection = Object.assign(
  (props: React.ComponentProps<'div'>) => {
    const coll = useCollection();
    const focusGroupProps = useFocusGroup({ focusGroup: 'listbox' });
    return (
      <coll.Provider>
        <div {...mergeProps(focusGroupProps, props, coll.props)} role="listbox">
          <style>{`
            @scope {
              display: flex;
              flex-direction: column;
              
              .story-collection-item {
                content-visibility: auto;
                contain-intrinsic-inline-size: none;
                contain-intrinsic-block-size: auto 2lh;
              }
              /*
              Test 'content-visibility' behavior. Note: apply the height to the inner icon, since browsers are smart
              enough to see the 'height' when applied to the item itself.
              */
              .story-collection-item:nth-child(n + 80) > * {
                height: 10lh;
              }
            }
          `}</style>
          {props.children}
        </div>
      </coll.Provider>
    );
  },
  { Item: CollectionItem },
);

const ScrollContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div>
      <style>{`
        @scope {
          outline: 1px solid purple;
          
          overflow-inline: hidden;
          overflow-block: auto;
          
          inline-size: 20ch;
          max-block-size: 20lh;
          padding: 0.8lh 1.4em;
        }
      `}</style>
      {children}
    </div>
  );
};


type CollectionArgs = React.ComponentProps<typeof Collection>;
type Story = StoryObj<CollectionArgs>;

export default {
  component: Collection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  // Note: this doesn't work well since local decorators are applied in an unintuitive order:
  // https://github.com/storybookjs/storybook/issues/23151
  //decorators: [Story => <ScrollContainer><Story/></ScrollContainer>],
  render: (args) => <ScrollContainer><Collection {...args}/></ScrollContainer>,
} satisfies Meta<CollectionArgs>;


//
// Sample items
//

const fruits = [
  'Apple',
  'Apricot',
  'Blueberry',
  'Cherry',
  'Durian',
  'Jackfruit',
  'Melon',
  'Mango',
  'Mangosteen',
  'Orange',
  'Peach',
  'Pineapple',
  'Razzberry',
  'Strawberry',
];

const generateItems = (itemCount: number) =>
  Object.fromEntries(Array.from({ length: itemCount }, (_, i) => i + 1).map(index => [`item-${index}`, {
    itemKey: `item-${index}`,
    label: `Item ${index}`,
  }]));



export const CollectionStandard: Story = {
  args: {
    children: (
      <>
        <CollectionItem itemKey="item-1" label="Item 1"/>
        <CollectionItem itemKey="item-2" label="Item 2"/>
        <CollectionItem itemKey="item-3" label="Item 3"/>
      </>
    ),
  },
};



type ColumnProps = React.ComponentProps<typeof Collection> & { itemKey: ItemKey };
const Column = ({ itemKey, ...propsRest }: ColumnProps) => {
  const itemProps = useCollectionItem({ itemKey });
  return (
    <Collection {...mergeProps(propsRest, itemProps)}/>
  );
};
type CollectionTwoColumnsProps = {
  left: React.ReactNode,
  right: React.ReactNode,
};
const CollectionTwoColumns = ({ left, right }: CollectionTwoColumnsProps) => {
  const { Provider: CollectionProvider, props } = useCollection();
  
  React.useEffect(() => {
    //...
  }, []);
  
  return (
    <ScrollContainer>
      <CollectionProvider>
        <div {...props}>
          <style>{`
            @scope {
              display: flex;
              flex-direction: column;
            }
          `}</style>
          
          <Column itemKey="left">{left}</Column>
          <Column itemKey="right">{right}</Column>
        </div>
      </CollectionProvider>
    </ScrollContainer>
  );
};

export const CollectionWithColumns: Story = {
  render: () => (
    <CollectionTwoColumns
      left={
        <>
          <CollectionItem itemKey="left-1">Left 1</CollectionItem>
          <CollectionItem itemKey="left-2">Left 2</CollectionItem>
        </>
      }
      right={
        <>
          <CollectionItem itemKey="right-1">right 1</CollectionItem>
          <CollectionItem itemKey="right-2">right 2</CollectionItem>
        </>
      }
    />
  ),
};



const CollectionWithControlsC = (args: CollectionArgs) => {
  // const [isTransitionPending, startTransition] = React.useTransition();
  const startTransition = (fn: any) => fn();
  
  const [itemCount, setItemCount] = React.useState(100);
  const [items, setItems] = React.useState<Record<ItemKey, CollectionItemProps>>(() => generateItems(itemCount));
  
  React.useEffect(() => {
    setItems(generateItems(itemCount));
  }, [itemCount]);
  
  const randomizeItems = React.useCallback(() => {
    setItems(items => {
      return Object.fromEntries(Object.entries(items)
        .toSorted(() => Math.random() >= 0.5 ? 1 : -1)
      );
    });
  }, []);
  
  // Randomize the items and inject one new item in the middle
  const randomizeItemsAndSplice = React.useCallback(() => {
    setItems(items => {
      const entries = Object.entries(items)
        .sort(() => Math.random() >= 0.5 ? 1 : -1);
      
      const randomId = (Math.round(Date.now())).toString(36);
      const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
      if (!newItem) { throw new Error(`Should not happen`); }
      const newItemKey = `${newItem}-${randomId}`;
      
      const startIndex = Math.floor(entries.length / 2);
      entries.splice(startIndex, 1, [newItemKey, { itemKey: newItemKey, children: newItemKey }]);
      
      return Object.fromEntries(entries);
    });
  }, []);
  
  const appendItem = React.useCallback(() => {
    const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
    if (!newItem) { throw new Error(`Should not happen`); }
    
    setItems(items => {
      const newItemKey = `${newItem}-${generateRandomId()}`;
      return { ...items, [newItemKey]: { itemKey: newItemKey, children: newItemKey } };
    });
  }, []);
  
  const prependItem = React.useCallback(() => {
    const newItem = fruits.at(Math.floor(Math.random() * fruits.length));
    if (!newItem) { throw new Error(`Should not happen`); }
    
    setItems(items => {
      const newItemKey = `${newItem}-${generateRandomId()}`;
      return { [newItemKey]: { itemKey: newItemKey, children: newItemKey }, ...items };
    });
  }, []);
  
  return (
    <div>
      <style>{`
        @scope {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .story-collection {}
        }
      `}</style>
      
      <div>
        <style>{`@scope { margin-block: 0.4lh; display: flex; gap: 1ch; align-items: center; }`}</style>
        <Button kind="secondary" label="10" onPress={() => { startTransition(() => { setItemCount(10); }); }}/>
        <Button kind="secondary" label="100" onPress={() => { startTransition(() => { setItemCount(100); }); }}/>
        <Button kind="secondary" label="1K" onPress={() => { startTransition(() => { setItemCount(1000); }); }}/>
        <Button kind="secondary" label="10K" onPress={() => { startTransition(() => { setItemCount(10_000); }); }}/>
      </div>
      
      <ScrollContainer>
        <Collection {...args} className="story-collection">
          {Object.entries(items).map(([itemKey, itemProps]) =>
            <Collection.Item key={itemKey} {...itemProps}/>
          )}
        </Collection>
      </ScrollContainer>
      
      <Button label="Append" onPress={() => { startTransition(() => { appendItem(); }); }}/>
      <Button label="Prepend" onPress={() => { startTransition(() => { prependItem(); }); }}/>
      <Button label="Randomize" onPress={() => { startTransition(() => { randomizeItems(); }); }}/>
      <Button label="Randomize + splice" onPress={() => { startTransition(() => { randomizeItemsAndSplice(); }); }}/>
    </div>
  );
};
export const CollectionWithControls: Story = {
  decorators: (_, { args }) => <CollectionWithControlsC {...args}/>,
};
