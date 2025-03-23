/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { type VirtualItem, type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';

import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';
import { ListBoxContext } from '../ListBox/ListBoxStore.tsx';
import { ListBox } from '../ListBox/ListBox.tsx';

import cl from './ListBoxLazy.module.scss';


export { cl as ListBoxLazyClassNames };

type ListBoxVirtualListProps<Item> = {
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  totalItems: number,
  renderItem: (item: VirtualItem) => React.ReactNode,
};
const ListBoxVirtualList = <Item,>(props: ListBoxVirtualListProps<Item>) => {
  const { virtualizer, totalItems, renderItem } = props;
  const store = React.use(ListBoxContext);
  
  React.useEffect(() => {
    if (!store) { return; }
    return store.subscribe((state, prevState) => {
      for (const key of Object.keys(state)) {
        if (state[key] !== prevState[key]) {
          console.log('CHANGED:', key);
        }
      }
      console.log('s', state);
    });
  }, [store]);
  
  // React.useEffect(() => {
  //   if (!store) { return; }
  //   const state = store.getState();
  //   
  //   // if (typeof context?.focusedItem !== 'number') { return; }
  //   // const targetIndex: number = context.focusedItem >= 0 ? context.focusedItem : (context.focusedItem + totalItems);
  //   
  //   // virtualizer.scrollToIndex(targetIndex);
  // }, [context?.focusedItem, virtualizer, totalItems]);
  
  return (
    // XXX we could do away with this extra <div> if we force a scroll bar with a (hidden?) item at the far end
    <div
      className={cx(cl['bk-list-box-lazy__scroller'])}
      style={{
        blockSize: virtualizer.getTotalSize(),
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        if (virtualItem.index === totalItems) {
          return (
            <ListBox.Header
              key={virtualItem.key}
              itemKey={`option_${virtualItem.key}`}
              label="Loading"
              className={cx(cl['bk-list-box-lazy__item'])}
              style={{
                blockSize: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`, // FIXME: logical property equivalent?
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '1ch' }}>
                Loading...
                <Spinner size="small" inline/>
              </span>
            </ListBox.Header>
          );
        }
        
        const content = renderItem(virtualItem);
        
        return (
          <ListBox.Option
            key={virtualItem.key}
            itemKey={`option_${virtualItem.key}`}
            aria-posinset={virtualItem.index}
            label={typeof content === 'string' ? content : undefined} // FIXME
            aria-setsize={totalItems}
            className={cx(cl['bk-list-box-lazy__item'])}
            style={{
              blockSize: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`, // FIXME: logical property equivalent?
            }}
          >
            {typeof content !== 'string' ? content : undefined}
          </ListBox.Option>
        );
      })}
    </div>
  );
};

export type ListBoxLazyProps<Item> = Omit<ComponentProps<typeof ListBox>, 'children'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The number of items in the list. */
  count: number,
  
  /** The maximum number of items to load. */
  limit: number,
  
  /** Size of a page (set of additional data to load in). Default: 10. */
  pageSize?: undefined | number,
  
  /** Request to update the limit. */
  onUpdateLimit: (limit: number) => void,
  
  /** Whether the list is currently in loading state. Default: false. */
  isLoading?: undefined | boolean,
  
  /** Callback to render the given list item. */
  renderItem: (item: VirtualItem) => React.ReactNode,
};
/**
 * A list box component that renders its items lazily.
 */
export const ListBoxLazy = <Item,>(props: ListBoxLazyProps<Item>) => {
  const {
    unstyled = false,
    count,
    limit,
    pageSize = 10,
    onUpdateLimit,
    isLoading = false,
    renderItem,
    ...propsRest
  } = props;
  
  const listBoxRef = React.useRef<React.ComponentRef<typeof ListBox>>(null);
  
  const virtualizer = useVirtualizer({
    count: count + (isLoading ? 1 : 0),
    getScrollElement: () => listBoxRef.current,
    estimateSize: () => 35, // FIXME: enforce this as the item height through CSS?
    overscan: 15,
  });
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: `virtualizer.getVirtualItems()` is a valid dep
  React.useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (!lastItem) { return; }
    
    const hasNextPage = true; // FIXME
    if (lastItem.index >= limit - 1 && hasNextPage && !isLoading) {
      onUpdateLimit(limit + pageSize);
    }
  }, [
    limit,
    pageSize,
    onUpdateLimit,
    isLoading,
    virtualizer.getVirtualItems(),
  ]);
  
  const itemKeys = React.useMemo(() => Array.from({ length: count }, (_, i) => `option_${i}`), [count]);
  
  return (
    <ListBox
      {...propsRest}
      ref={mergeRefs(listBoxRef, props.ref)}
      className={cx(
        'bk',
        { [cl['bk-list-box-lazy']]: !unstyled },
        propsRest.className,
      )}
      itemKeys={itemKeys}
      isVirtualItemKeyFocusable={() => true} // FIXME
    >
      <ListBoxVirtualList virtualizer={virtualizer} totalItems={count} renderItem={renderItem}/>
    </ListBox>
  );
};
