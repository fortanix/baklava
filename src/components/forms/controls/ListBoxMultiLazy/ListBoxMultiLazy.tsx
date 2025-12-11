/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import {
  type Range,
  type VirtualItem,
  type Virtualizer,
  defaultRangeExtractor,
  useVirtualizer,
} from '@tanstack/react-virtual';

import {
  type ItemKey,
  type VirtualItemKeys,
  VirtualItemKeysUtil,
  useListBoxSelector,
} from '../ListBoxMulti/ListBoxStore.tsx';
import { type ListBoxMultiRef, ListBoxMulti } from '../ListBoxMulti/ListBoxMulti.tsx';

import cl from './ListBoxMultiLazy.module.scss';


export { cl as ListBoxLazyClassNames };


type ListItemVirtualProps = {
  virtualItem: VirtualItem,
  itemsCount: number,
  renderItem: (item: VirtualItem) => React.ReactNode,
  renderItemLabel: (item: VirtualItem) => string,
};
const ListItemVirtual = ({ virtualItem, itemsCount, renderItem, renderItemLabel }: ListItemVirtualProps) => {
  const styles = React.useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    blockSize: virtualItem.size,
    transform: `translateY(${virtualItem.start}px)`,
  }), [virtualItem.size, virtualItem.start]);
  
  const content = renderItem(virtualItem);
  const label = renderItemLabel(virtualItem);
  
  return (
    <ListBoxMulti.Option
      itemKey={String(virtualItem.key)}
      aria-posinset={virtualItem.index}
      label={label}
      aria-setsize={itemsCount}
      className={cx(cl['bk-list-box-multi-lazy__item'])}
      style={styles}
    >
      {typeof content !== 'string' ? content : undefined}
    </ListBoxMulti.Option>
  );
};


// Calculate if the user has scrolled to near the end of the scroll container
const isScrollNearEnd = (virtualizer: Virtualizer<ListBoxMultiRef, Element>): boolean => {
  const scrollRectHeight = virtualizer.scrollRect?.height ?? null;
  if (virtualizer.scrollOffset === null || scrollRectHeight === null) {
    return false;
  }
  
  const distanceFromEnd = virtualizer.getTotalSize() - (virtualizer.scrollOffset + scrollRectHeight);
  return distanceFromEnd < (scrollRectHeight / 2);
};


type ListBoxVirtualListProps = {
  scrollElement: null | React.ComponentRef<typeof ListBoxMulti>,
  virtualItemKeys: VirtualItemKeys,
  limit: number,
  pageSize: number,
  hasMoreItems: boolean,
  onUpdateLimit: (limit: number) => void,
  isLoading: boolean,
  renderItem: ListItemVirtualProps['renderItem'],
  renderItemLabel: ListItemVirtualProps['renderItemLabel'],
};
const ListBoxVirtualList = (props: ListBoxVirtualListProps) => {
  const {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize,
    hasMoreItems,
    onUpdateLimit,
    isLoading,
    renderItem,
    renderItemLabel,
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
    return virtualItemKey ?? `__INVALID-INDEX_${index}`;
  }, [virtualItemKeys]);
  
  const virtualizer = useVirtualizer({
    count: virtualItemKeys.length,
    getScrollElement: () => scrollElement,
    getItemKey,
    estimateSize: () => 35, // FIXME: enforce this as the item height through CSS?
    overscan: 15,
    rangeExtractor: rangeExtractorWithFocused,
    useAnimationFrameWithResizeObserver: true,
  });
  
  const virtualItems = virtualizer.getVirtualItems();
  const scrollNearEnd = isScrollNearEnd(virtualizer);
  
  React.useEffect(() => {
    if (hasMoreItems && scrollNearEnd && !isLoading) {
      onUpdateLimit(limit + pageSize);
    }
  }, [
    scrollNearEnd,
    hasMoreItems,
    isLoading,
    onUpdateLimit,
    limit,
    pageSize,
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
  
  return (
    // FIXME: we could do away with this extra <div> if we force a scroll bar with a (hidden?) item at the far end
    <div
      className={cx(cl['bk-list-box-multi-lazy__scroller'])}
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
          renderItemLabel={renderItemLabel}
        />
      )}
    </div>
  );
};

/**
 * A list box component that renders its items lazily.
 */
export type ListBoxMultiLazyProps = Omit<ComponentProps<typeof ListBoxMulti>, 'children' | 'virtualItemKeys'> & {
  /** The full list of item keys (possibly lazily computed). */
  virtualItemKeys: VirtualItemKeys,
  
  /** The maximum number of items to load. */
  limit: ListBoxVirtualListProps['limit'],
  
  /** Size of a page (set of additional data to load in). Default: 10. */
  pageSize?: undefined | ListBoxVirtualListProps['pageSize'],
  
  /** Whether there are more items, to be loaded. Default: false. */
  hasMoreItems?: undefined | ListBoxVirtualListProps['hasMoreItems'],
  
  /** Request to update the limit. */
  onUpdateLimit: ListBoxVirtualListProps['onUpdateLimit'],
  
  /** Callback to render the given list item. */
  renderItem: ListBoxVirtualListProps['renderItem'],
  
  /** Callback to render the given list item as a human-readable name. */
  renderItemLabel: ListBoxVirtualListProps['renderItemLabel'],
};
export const ListBoxMultiLazy = (props: ListBoxMultiLazyProps) => {
  const {
    unstyled = false,
    virtualItemKeys,
    limit,
    pageSize = 10,
    hasMoreItems = false,
    onUpdateLimit,
    isLoading = false,
    renderItem,
    renderItemLabel,
    ...propsRest
  } = props;
  
  const [scrollElement, setScrollElement] = React.useState<null | React.ComponentRef<typeof ListBoxMulti>>(null);
  const listBoxRef = (element: React.ComponentRef<typeof ListBoxMulti>) => { setScrollElement(element); };
  
  const propsVirtualList: ListBoxVirtualListProps = {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize,
    hasMoreItems,
    onUpdateLimit,
    isLoading,
    renderItem,
    renderItemLabel,
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
    return renderItemLabel(virtualItem);
  }, [renderItemLabel]);
  
  return (
    <ListBoxMulti
      {...propsRest}
      ref={mergeRefs(listBoxRef, props.ref)}
      className={cx(
        'bk',
        { [cl['bk-list-box-multi-lazy']]: !unstyled },
        propsRest.className,
      )}
      virtualItemKeys={virtualItemKeys}
      formatItemLabel={formatItemLabel}
      isLoading={isLoading}
    >
      <ListBoxVirtualList {...propsVirtualList}/>
    </ListBoxMulti>
  );
};
