/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import {
  type Range,
  type VirtualItem,
  defaultRangeExtractor,
  useVirtualizer,
} from '@tanstack/react-virtual';

import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';
import {
  type ItemKey,
  type VirtualItemKeys,
  VirtualItemKeysUtil,
  useListBoxSelector,
} from '../ListBox/ListBoxStore.tsx';
import { ListBox } from '../ListBox/ListBox.tsx';

import cl from './ListBoxLazy.module.scss';


export { cl as ListBoxLazyClassNames };


type ListItemVirtualProps = {
  virtualItem: VirtualItem,
  itemsCount: number,
  renderItem: (item: VirtualItem) => React.ReactNode,
};
const ListItemVirtual = ({ virtualItem, itemsCount, renderItem }: ListItemVirtualProps) => {
  const styles = React.useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    blockSize: virtualItem.size,
    transform: `translateY(${virtualItem.start}px)`, // FIXME: logical property equivalent?
  }), [virtualItem.size, virtualItem.start]);
  
  if (virtualItem.index >= itemsCount) {
    return (
      <ListBox.Header
        itemKey={String(virtualItem.key)}
        label="Loading"
        className={cx(cl['bk-list-box-lazy__item'])}
        style={styles}
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
      itemKey={String(virtualItem.key)}
      aria-posinset={virtualItem.index}
      label={typeof content === 'string' ? content : ''} // FIXME: require some accessible name here?
      aria-setsize={itemsCount}
      className={cx(cl['bk-list-box-lazy__item'])}
      style={styles}
    >
      {typeof content !== 'string' ? content : undefined}
    </ListBox.Option>
  );
};


type ListBoxVirtualListProps = {
  scrollElement: null | React.ComponentRef<typeof ListBox>,
  virtualItemKeys: VirtualItemKeys,
  limit: number,
  pageSize: number,
  onUpdateLimit: (limit: number) => void,
  isLoading: boolean,
  renderItem: ListItemVirtualProps['renderItem'],
};
const ListBoxVirtualList = (props: ListBoxVirtualListProps) => {
  const {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize,
    onUpdateLimit,
    isLoading,
    renderItem,
  } = props;
  
  const focusedItemKey = useListBoxSelector(s => s.focusedItem);
  const focusedItemIndex: null | number = focusedItemKey === null
    ? null
    : VirtualItemKeysUtil.indexForItemKey(virtualItemKeys, focusedItemKey);
  
  // Range extractor for `useVirtualizer` that always includes the focused item, if there is one. This is so that we
  // do not "lose" the focused item when it gets scrolled out of view (for accessibility).
  const rangeExtractorWithFocused = React.useCallback((range: Range) => {
    // For an example, see: https://tanstack.com/virtual/latest/docs/framework/react/examples/sticky?panel=code
    let indices: Array<number> = defaultRangeExtractor(range);
    if (focusedItemIndex !== null) {
      // Note: the array must be deduplicated (otherwise we get the same item rendered multiple times), and it must
      // also be sorted (otherwise focus scroll into view becomes buggy).
      indices = [...new Set([
        0, // First item
        Math.max(0, focusedItemIndex - 10), // Previous "page"
        Math.max(0, focusedItemIndex - 1), // Previous element
        focusedItemIndex,
        Math.min(virtualItemKeys.length - 1, focusedItemIndex + 1), // Next element
        Math.min(virtualItemKeys.length - 1, focusedItemIndex + 10), // Next "page"
        virtualItemKeys.length - 1, // Last item
        ...indices,
      ])].sort((index1, index2) => index1 - index2);
    }
    return indices;
  }, [focusedItemIndex, virtualItemKeys.length]);
  
  const getItemKey = React.useCallback((index: number) => {
    const virtualItemKey = virtualItemKeys.at(index);
    if (typeof virtualItemKey === 'undefined' && isLoading && index === virtualItemKeys.length) {
      return '__LOADING';
    }
    return virtualItemKey ?? `__INVALID-INDEX_${index}`;
  }, [virtualItemKeys, isLoading]);
  
  const virtualizer = useVirtualizer({
    count: virtualItemKeys.length + (isLoading ? 1 : 0),
    getScrollElement: () => scrollElement,
    getItemKey,
    estimateSize: () => 35, // FIXME: enforce this as the item height through CSS?
    overscan: 15,
    rangeExtractor: rangeExtractorWithFocused,
    useAnimationFrameWithResizeObserver: true,
  });
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: `virtualizer.getVirtualItems()` is a valid dep
  React.useEffect(() => {
    const virtualItemsSorted = virtualizer.getVirtualItems().toSorted((item1, item2) => item1.index - item2.index);
    const lastItem = virtualItemsSorted.at(-1);
    if (!lastItem) { return; } // If the list is empty, ignore
    
    const hasNextPage = true; // FIXME
    if (!isLoading && lastItem.index >= limit - 1 && hasNextPage) {
      onUpdateLimit(limit + pageSize);
    }
  }, [
    limit,
    pageSize,
    onUpdateLimit,
    isLoading,
    virtualizer.getVirtualItems(),
  ]);
  
  /*
  // Alternative idea for the "injecting first/last/etc. items into `rangeExtractorWithFocused`" solution for focusing
  // items during keyboard navigation: use `virtualizer.scrollToIndex()` instead.
  React.useEffect(() => {
    if (!store) { return; }
    const state = store.getState();
    
    if (typeof context?.focusedItem !== 'number') { return; }
    const targetIndex: number = context.focusedItem >= 0 ? context.focusedItem : (context.focusedItem + totalItems);
    
    virtualizer.scrollToIndex(targetIndex);
  }, [context?.focusedItem, virtualizer, totalItems]);
  */
  
  const virtualItems = virtualizer.getVirtualItems();
  
  return (
    // FIXME: we could do away with this extra <div> if we force a scroll bar with a (hidden?) item at the far end
    <div
      className={cx(cl['bk-list-box-lazy__scroller'])}
      style={{
        blockSize: virtualizer.getTotalSize(),
      }}
    >
      {virtualItems.map((virtualItem) =>
        <ListItemVirtual
          key={virtualItem.key}
          virtualItem={virtualItem}
          itemsCount={virtualItemKeys.length}
          renderItem={renderItem}
        />
      )}
    </div>
  );
};

/**
 * A list box component that renders its items lazily.
 */
export type ListBoxLazyProps = Omit<ComponentProps<typeof ListBox>, 'children' | 'virtualItemKeys'> & {
  /** The full list of item keys (possibly lazily computed). */
  virtualItemKeys: VirtualItemKeys,
  
  /** The maximum number of items to load. */
  limit: ListBoxVirtualListProps['limit'],
  
  /** Size of a page (set of additional data to load in). Default: 10. */
  pageSize?: undefined | ListBoxVirtualListProps['pageSize'],
  
  /** Request to update the limit. */
  onUpdateLimit: ListBoxVirtualListProps['onUpdateLimit'],
  
  /** Whether the list is currently in loading state. Default: false. */
  isLoading?: undefined | ListBoxVirtualListProps['isLoading'],
  
  /** Callback to render the given list item. */
  renderItem: ListBoxVirtualListProps['renderItem'],
};
export const ListBoxLazy = (props: ListBoxLazyProps) => {
  const {
    unstyled = false,
    virtualItemKeys,
    limit,
    pageSize = 10,
    onUpdateLimit,
    isLoading = false,
    renderItem,
    ...propsRest
  } = props;
  
  const [scrollElement, setScrollElement] = React.useState<null | React.ComponentRef<typeof ListBox>>(null);
  const listBoxRef = (element: React.ComponentRef<typeof ListBox>) => { setScrollElement(element); };
  
  const propsVirtualList: ListBoxVirtualListProps = {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize,
    onUpdateLimit,
    isLoading,
    renderItem,
  };
  
  const formatItemLabel = React.useCallback((itemKey: ItemKey) => {
    const virtualItem: VirtualItem = {
      key: itemKey,
      index: 0,
      start: 0,
      end: 0,
      size: 0,
      lane: 0,
    };
    const label = renderItem(virtualItem);
    
    if (typeof label !== 'string') {
      console.warn(`Unable to render item to string label: '${itemKey}', found type '${typeof label}'`);
    }
    
    return typeof label === 'string' ? label : '';
  }, [renderItem]);
  
  return (
    <ListBox
      {...propsRest}
      ref={mergeRefs(listBoxRef, props.ref)}
      className={cx(
        'bk',
        { [cl['bk-list-box-lazy']]: !unstyled },
        propsRest.className,
      )}
      virtualItemKeys={virtualItemKeys}
      formatItemLabel={formatItemLabel}
    >
      <ListBoxVirtualList {...propsVirtualList}/>
    </ListBox>
  );
};
