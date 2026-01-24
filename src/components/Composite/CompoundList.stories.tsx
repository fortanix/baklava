
import * as React from 'react';
import { useMemoOnce, mergeProps } from '../../util/reactUtil.ts';

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



type ColumnProps = React.ComponentProps<typeof List> & { itemKey: ItemKey };
const Column = ({ itemKey, ...propsRest }: ColumnProps) => {
  const itemProps = useCompoundListItem({ itemKey });
  return (
    <List {...mergeProps(propsRest, itemProps)}/>
  );
};
type ListTwoColumnsProps = {
  left: React.ReactNode,
  right: React.ReactNode,
};
const ListTwoColumns = ({ left, right }: ListTwoColumnsProps) => {
  const { Provider: CompoundListProvider, props } = useCompoundList<HTMLDivElement>();
  
  React.useEffect(() => {
    //...
  }, []);
  
  return (
    <CompoundListProvider>
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
    </CompoundListProvider>
  );
};

export const ListWithColumns: Story = {
  render: () => (
    <ListTwoColumns
      left={
        <>
          <ListItem itemKey="left-1">Left 1</ListItem>
          <ListItem itemKey="left-2">Left 2</ListItem>
        </>
      }
      right={
        <>
          <ListItem itemKey="right-1">right 1</ListItem>
          <ListItem itemKey="right-2">right 2</ListItem>
        </>
      }
    />
  ),
};








import { useFocus } from '@react-aria/interactions';
import { FocusScope, useFocusManager } from '@react-aria/focus';
import { normalizeQueryString, useTypeAhead } from '../../util/hooks/useTypeAhead.ts';

type UseToolbarItemResult = {
  props: React.ComponentProps<'button'>,
};
const useToolbarItem = (): UseToolbarItemResult => {
  const focusManager = useFocusManager();
  if (!focusManager) { throw new Error(`Missing FocusScope context provider`); }
  
  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusNext({ wrap: true });
        break;
      case 'ArrowLeft':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusPrevious({ wrap: true });
        break;
      case 'ArrowUp':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusFirst();
        break;
      case 'ArrowDown':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusLast();
        break;
    }
  };
  
  return {
    props: { onKeyDown },
  };
};

type ToolbarButtonProps = React.PropsWithChildren<{
  itemKey: ItemKey,
  focusedItemKey: ItemKey,
  updateFocusedItemKey: (itemKey: ItemKey) => void,
}>;
const ToolbarButton = ({ children, itemKey, focusedItemKey, updateFocusedItemKey }: ToolbarButtonProps) => {
  const isFocused = itemKey === focusedItemKey;
  
  const { focusProps } = useFocus({
    onFocusChange: isFocused => {
      if (isFocused) {
        updateFocusedItemKey(itemKey);
      }
    },
  });
  
  const { props: listBoxItemProps } = useToolbarItem();
  
  return (
    <Button {...mergeProps(focusProps, listBoxItemProps)} tabIndex={isFocused ? 0 : -1}>{children}</Button>
  );
};


const Toolbar = () => {
  const [focusedItemKey, setFocusedItemKey] = React.useState('italic');
  return (
    <FocusScope>
      <div role="toolbar" aria-label="Text formatting">
        <ToolbarButton focusedItemKey={focusedItemKey} updateFocusedItemKey={setFocusedItemKey} itemKey="bold">Bold</ToolbarButton>
        <ToolbarButton focusedItemKey={focusedItemKey} updateFocusedItemKey={setFocusedItemKey} itemKey="italic">Italic</ToolbarButton>
        <ToolbarButton focusedItemKey={focusedItemKey} updateFocusedItemKey={setFocusedItemKey} itemKey="underline">Underline</ToolbarButton>
      </div>
    </FocusScope>
  );
};

export const ReactAriaToolbar = {
  render: () => (
    <>
      <div><Button kind="secondary" label="Before"/></div>
      <Toolbar/>
      <div><Button kind="secondary" label="After"/></div>
    </>
  ),
};













class ListBoxStore {
  #listeners = new Set<() => void>();
  
  // State
  #registry: Map<ItemKey, Element>;
  #focusedItemKey: null | ItemKey = null;
  
  constructor({ focusedItemKey }: { focusedItemKey: null | ItemKey }) {
    this.#registry = new Map();
    this.#focusedItemKey = focusedItemKey;
  }
  
  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };
  
  getSnapshot = () => {
    return {
      focusedItemKey: this.#focusedItemKey,
    };
  };
  
  // Store API
  
  register(itemKey: ItemKey, itemRef: Element) {
    this.#registry.set(itemKey, itemRef);
    return () => {
      this.#registry.delete(itemKey);
    };
  }
  
  requestFocus = (itemKey: null | ItemKey) => {
    this.#focusedItemKey = itemKey;
    
    if (itemKey !== null) {
      const ref = this.#registry.get(itemKey);
      if (ref instanceof HTMLElement) {
        ref?.focus();
      }
    }
    
    this.#listeners.forEach(listener => { listener(); }); // Publish
  };
  
  #elementMatchesQuery = (element: Element, query: string): boolean => {
    const textContent = normalizeQueryString(element.textContent);
    return textContent.startsWith(query);
  };
  
  // Note: assumes `query` is already normalized using `normalizeQueryString`
  searchByPrefix = (query: string): null | ItemKey => {
    if (query === '') { return null; }
    
    // Check if the currently focused item matches the query, if so don't move off of the focused item
    if (this.#focusedItemKey !== null) {
      const focusedRef = this.#registry.get(this.#focusedItemKey);
      
      if (typeof focusedRef !== 'undefined') {
        if (this.#elementMatchesQuery(focusedRef, query)) {
          return this.#focusedItemKey;
        }
      }
    }
    
    // Otherwise, return the first candidate we find
    let candidate = null;
    for (const [itemKey, itemRef] of this.#registry.entries()) {
      if (this.#elementMatchesQuery(itemRef, query)) {
        if (candidate === null) {
          candidate = itemKey;
          break;
        }
      }
    }
    
    return candidate;
  };
}

/*
// DOESN'T WORK, since we want to only subscribe to `focusedItemKey`
type ListBoxContext = {
  focusedItemKey: null | ItemKey,
  requestFocus: (itemKey: ItemKey) => void,
};
const ListBoxContext = React.createContext<null | ListBoxContext>(null);
const useListBoxContext = (): ListBoxContext => {
  const context = React.use(ListBoxContext);
  if (context === null) { throw new Error(`Missing ListBoxContext`); }
  return context;
};
*/

type ListBoxContext = {
  store: ListBoxStore,
};
const ListBoxContext = React.createContext<null | ListBoxContext>(null);
const useListBoxContext = (): ListBoxContext => {
  const context = React.use(ListBoxContext);
  if (context === null) { throw new Error(`Missing ListBoxContext`); }
  return context;
};

type UseListBoxOptionOptions = {
  itemKey: ItemKey,
};
type UseListBoxOptionResult = {
  props: React.ComponentProps<'button'>,
};
const useListBoxOption = (options: UseListBoxOptionOptions): UseListBoxOptionResult => {
  const { itemKey } = options;
  
  const { store } = useListBoxContext();
  
  const focusManager = useFocusManager();
  if (!focusManager) { throw new Error(`Missing FocusScope context provider`); }
  
  const pageSize = 10;
  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusPrevious({ wrap: false }); break;
      case 'ArrowDown':
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusNext({ wrap: false }); break;
      case 'Home': // On Mac: Fn + ArrowLeft
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusFirst(); break;
      case 'End': // On Mac: Fn + ArrowRight
        event.preventDefault(); // Prevent keyboard scroll
        focusManager.focusLast(); break;
      case 'PageUp': // On Mac: Fn + ArrowUp
        event.preventDefault(); // Prevent keyboard scroll
        for (let i = 0; i < pageSize; i++) {
          focusManager.focusPrevious({ wrap: false });
        }
        break;
      case 'PageDown': // On Mac: Fn + ArrowDown
        event.preventDefault(); // Prevent keyboard scroll
        for (let i = 0; i < pageSize; i++) {
          focusManager.focusNext({ wrap: false });
        }
        break;
    }
  };
  
  return {
    props: {
      onKeyDown,
      ref: el => {
        if (el === null) {
          // This should not happen in React 19, given that we return a callback below
          console.warn('Received a `null` value in a `ref` callback: should not happen');
          return;
        }
        return store.register(itemKey, el);
      },
    },
  };
};

type UseListBoxOptions = {
  defaultFocusedItemKey?: undefined | null | ItemKey,
};
type UseListBoxResult<E extends HTMLElement> = {
  context: ListBoxContext,
  props: React.DetailedHTMLProps<React.HTMLAttributes<E>, E>,
};
const useListBox = <E extends HTMLElement>(options: UseListBoxOptions = {}): UseListBoxResult<E> => {
  const {
    defaultFocusedItemKey = null,
  } = options;
  
  const context = useMemoOnce<ListBoxContext>(() => ({
    store: new ListBoxStore({ focusedItemKey: defaultFocusedItemKey }),
  }));
  
  const typeAhead = useTypeAhead(800);
  
  React.useEffect(() => {
    const itemKeyMatched = context.store.searchByPrefix(typeAhead.query);
    
    if (itemKeyMatched !== null) {
      context.store.requestFocus(itemKeyMatched);
    }
  }, [typeAhead.query]);
  
  return {
    context,
    props: {
      onKeyDown: typeAhead.handleKeyDown,
    },
  };
};

type ListBoxOptionProps = React.PropsWithChildren<{
  itemKey: ItemKey,
}>;
const ListBoxOption = ({ children, itemKey }: ListBoxOptionProps) => {
  const { store } = useListBoxContext();
  
  const focusedItemKey = React.useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().focusedItemKey,
  );
  
  const isFocused = itemKey === focusedItemKey;
  
  const { focusProps } = useFocus({
    onFocusChange: isFocused => {
      if (isFocused) {
        store.requestFocus(itemKey);
      }
    },
  });
  
  const { props: listBoxItemProps } = useListBoxOption({ itemKey });
  
  return (
    <Button {...mergeProps(focusProps, listBoxItemProps)} tabIndex={isFocused ? 0 : -1}>{children}</Button>
  );
};


type ListBoxProps = React.PropsWithChildren;
const ListBox = ({ children }: ListBoxProps) => {
  const { context, props } = useListBox<HTMLDivElement>({ defaultFocusedItemKey: 'option-2' });
  
  return (
    <ListBoxContext value={context}>
      <div role="listbox" {...props}>
        <style>{`
          @scope {
            block-size: 200px;
            overflow-y: auto;
            
            display: flex;
            flex-direction: column;
            
            > *:not([hidden]) {
              content-visibility: auto;
              contain-intrinsic-block-size: 2lh;
              block-size: 2lh;
              flex-shrink: 0;
            }
          }
        `}</style>
        <FocusScope contain={false}>
          {children}
        </FocusScope>
      </div>
    </ListBoxContext>
  );
};

export const ReactAriaListBox = {
  render: () => (
    <>
      <div><Button kind="secondary" label="Before"/></div>
      <ListBox>
        <ListBoxOption key="option-apple" itemKey="option-apple">Apple</ListBoxOption>
        <ListBoxOption key="option-apricot" itemKey="option-apricot">Apricot</ListBoxOption>
        <ListBoxOption key="option-banana" itemKey="option-banana">Banana</ListBoxOption>
        {Array.from({ length: 1000 }, (_, i) => i + 1).map(index =>
          <ListBoxOption key={`option-${index}`} itemKey={`option-${index}`}>Option {index}</ListBoxOption>
        )}
      </ListBox>
      <div><Button kind="secondary" label="After"/></div>
    </>
  ),
};
