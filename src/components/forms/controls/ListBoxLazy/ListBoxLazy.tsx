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
} from '../ListBox/ListBoxStore.tsx';
import {
  type ListBoxRef,
  type ItemDetails,
  ListBox,
  EmptyPlaceholder,
  LoadingSpinner,
  ListBoxClassNames,
} from '../ListBox/ListBox.tsx';
import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';

import cl from './ListBoxLazy.module.scss';


export type { VirtualItem, ItemKey, VirtualItemKeys, ItemDetails, ListBoxRef };
export { cl as ListBoxLazyClassNames };


type ListItemVirtualProps = {
  ref?: undefined | React.Ref<null | HTMLButtonElement>,
  virtualItem: VirtualItem,
  itemsCount: number,
  renderItem: (item: VirtualItem) => React.ReactNode,
  formatItemLabel: (item: ItemKey) => string,
};
const ListItemVirtual = ({ ref, virtualItem, itemsCount, renderItem, formatItemLabel }: ListItemVirtualProps) => {
  const styles = React.useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${virtualItem.start}px)`,
  }), [virtualItem.start]);
  
  const content = renderItem(virtualItem);
  const label = formatItemLabel(String(virtualItem.key));
  
  return (
    <ListBox.Option
      ref={ref}
      data-index={virtualItem.index}
      itemKey={String(virtualItem.key)}
      aria-posinset={virtualItem.index}
      label={label}
      aria-setsize={itemsCount}
      className={cx(cl['bk-list-box-lazy__item'])}
      style={styles}
    >
      {typeof content !== 'string' ? content : undefined}
    </ListBox.Option>
  );
};


// Calculate if the user has scrolled to near the end of the scroll container
const isScrollNearEnd = (virtualizer: Virtualizer<ListBoxRef, Element>): boolean => {
  const scrollRectHeight = virtualizer.scrollRect?.height ?? null;
  if (virtualizer.scrollOffset === null || scrollRectHeight === null) {
    return false;
  }
  
  const distanceFromEnd = virtualizer.getTotalSize() - (virtualizer.scrollOffset + scrollRectHeight);
  return distanceFromEnd < (scrollRectHeight / 2);
};


type ListBoxVirtualListProps = {
  scrollElement: null | React.ComponentRef<typeof ListBox>,
  virtualItemKeys: VirtualItemKeys,
  limit: number,
  pageSize?: undefined | number,
  hasMoreItems?: undefined | boolean,
  onUpdateLimit?: undefined | ((limit: number) => void),
  isLoading: boolean,
  placeholderEmpty?: undefined | false | React.ReactNode,
  renderItem: ListItemVirtualProps['renderItem'],
  formatItemLabel: ListItemVirtualProps['formatItemLabel'],
  loadMoreItemsTriggerType?: undefined | 'scroll' | 'custom',
  loadMoreItemsTrigger?: undefined | React.ReactNode,
};
const ListBoxVirtualList = (props: ListBoxVirtualListProps) => {
  const {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize = 10,
    hasMoreItems = false,
    onUpdateLimit,
    isLoading,
    placeholderEmpty = 'No items',
    renderItem,
    formatItemLabel,
    loadMoreItemsTriggerType = 'scroll',
    loadMoreItemsTrigger,
  } = props;

  const id = useListBoxSelector(s => s.id);
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
 
  const isEmpty = useListBoxSelector(state => state.isEmpty());

  const virtualizer = useVirtualizer({
    count: virtualItemKeys.length,
    getScrollElement: () => scrollElement,
    getItemKey,
    estimateSize: () => 35,
    measureElement: element => element.getBoundingClientRect().height,
    overscan: 15,
    rangeExtractor: rangeExtractorWithFocused,
    useAnimationFrameWithResizeObserver: true,
  });
  
  const virtualItems = virtualizer.getVirtualItems();
  const scrollNearEnd = isScrollNearEnd(virtualizer);
  
  React.useEffect(() => {
    if (loadMoreItemsTriggerType === 'scroll'
      && hasMoreItems
      && scrollNearEnd
      && !isLoading
    ) {
      onUpdateLimit?.(limit + pageSize);
    }
  }, [
    scrollNearEnd,
    hasMoreItems,
    isLoading,
    onUpdateLimit,
    limit,
    pageSize,
    loadMoreItemsTriggerType,
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
  
  const renderLoadingSpinner = () => {
    return <LoadingSpinner className={cx(cl['bk-list-box-lazy__item'])} id={`${id}_loading-spinner`}/>;
  };

  const renderScrollTrigger = () => {
    return isLoading ? renderLoadingSpinner() : null;
  };

  const renderCustomTrigger = () => {
    if (!loadMoreItemsTrigger) { return null; }

    return (
      <div
        // Attribute `data-trigger-type` fixes a Chrome-specific issue:
        // when the `loadMoreItemsTrigger` is replaced by a loading spinner during
        // async updates, Chrome drops focus and fires a `focusout` event with
        // `relatedTarget` as `null`. This focus loss does not represent user intent
        // to close the listbox. The attribute allows the `focusout` handler in
        // `MenuMultiProvider` to detect this internal update and keep the listbox open.
        data-trigger-type="custom"
        className={cx(
          cl['bk-list-box-lazy__item'],
          ListBoxClassNames['bk-list-box__item'],
          ListBoxClassNames['bk-list-box__item--static'],
          { [ListBoxClassNames['bk-list-box__item--loading']]: isLoading },
        )}
      >
        {isLoading
          ? <>Loading... <Spinner inline size="small"/></>
          : loadMoreItemsTrigger
        }
      </div>
    );
  };

  return (
    // FIXME: we could do away with this extra <div> if we force a scroll bar with a (hidden?) item at the far end
    <>
      <div
        className={cx(cl['bk-list-box-lazy__scroller'])}
        style={{
          blockSize: virtualizer.getTotalSize(),
        }}
      >
        {virtualItems.map((virtualItem) =>
          <ListItemVirtual
            ref={virtualizer.measureElement}
            key={virtualItem.key}
            virtualItem={virtualItem}
            itemsCount={virtualItemKeys.length}
            renderItem={renderItem}
            formatItemLabel={formatItemLabel}
          />
        )}
      </div>

      {isEmpty && placeholderEmpty !== false && !isLoading &&
        <EmptyPlaceholder id={`${id}_empty-placeholder`}>{placeholderEmpty}</EmptyPlaceholder>
      }

      {loadMoreItemsTriggerType === 'scroll' && renderScrollTrigger()}
      {loadMoreItemsTriggerType === 'custom' && renderCustomTrigger()}
    </>
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
  
  /** Whether there are more items, to be loaded. Default: false. */
  hasMoreItems?: undefined | ListBoxVirtualListProps['hasMoreItems'],
  
  /** Request to update the limit. */
  onUpdateLimit?: undefined | ListBoxVirtualListProps['onUpdateLimit'],
  
  /** Callback to render the given list item. */
  renderItem: ListBoxVirtualListProps['renderItem'],
  
  /** Callback to render the given list item as a human-readable name. */
  formatItemLabel: ListBoxVirtualListProps['formatItemLabel'],

  /** Determines how additional items are loaded: automatically on scroll, or through a custom trigger. */
  loadMoreItemsTriggerType?: undefined | ListBoxVirtualListProps['loadMoreItemsTriggerType'],

  /** A render function for the custom trigger element, used when loadMoreItemsTriggerType is set to 'custom'. */
  loadMoreItemsTrigger?: undefined | ListBoxVirtualListProps['loadMoreItemsTrigger'],
};
export const ListBoxLazy = (props: ListBoxLazyProps) => {
  const {
    unstyled = false,
    virtualItemKeys,
    limit,
    pageSize = 10,
    hasMoreItems = false,
    onUpdateLimit,
    isLoading = false,
    placeholderEmpty,
    renderItem,
    formatItemLabel,
    loadMoreItemsTriggerType,
    loadMoreItemsTrigger,
    ...propsRest
  } = props;
  
  const [scrollElement, setScrollElement] = React.useState<null | React.ComponentRef<typeof ListBox>>(null);
  const listBoxRef = (element: React.ComponentRef<typeof ListBox>) => { setScrollElement(element); };
  
  const propsVirtualList: ListBoxVirtualListProps = {
    scrollElement,
    virtualItemKeys,
    limit,
    pageSize,
    hasMoreItems,
    onUpdateLimit,
    isLoading,
    placeholderEmpty,
    renderItem,
    formatItemLabel: formatItemLabel,
    loadMoreItemsTriggerType,
    loadMoreItemsTrigger,
  };
  
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
      placeholderEmpty={false}
    >
      <ListBoxVirtualList {...propsVirtualList}/>
    </ListBox>
  );
};
