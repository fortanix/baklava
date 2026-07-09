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

import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';

import { PlaceholderEmpty, PlaceholderLoading } from '../../../actions/MenuList/MenuList.tsx';
import { type ItemKey, useListBoxSelector } from '../../../util/collections/ListBoxStore.ts';
import {
  type ListBoxRef,
  type SelectedStateProps,
  ListBox,
  ListBoxClassNames,
} from '../ListBox/ListBox.tsx';

import cl from './ListBoxLazy.module.scss';


export type { VirtualItem, ItemKey, ListBoxRef };
export { cl as ListBoxLazyClassNames };

export type VirtualItemKeys = Pick<ReadonlyArray<ItemKey>, 'length' | 'at' | 'indexOf'>;
// export const VirtualItemKeysUtil = {
//   /** Find the index of the given `itemKey`, or `null` if not found in the list. */
//   indexForItemKey(virtualItemKeys: VirtualItemKeys, itemKey: ItemKey): null | number {
//     const index = virtualItemKeys.indexOf(itemKey);
//     return index >= 0 ? index : null;
//   },
// };

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
      data-index={virtualItem.index} // Needed for custom `rangeExtractor`
      itemKey={String(virtualItem.key)}
      label={label}
      aria-posinset={virtualItem.index + 1}
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


const useFocusedItemIndex = () => {
  const id = useListBoxSelector(state => state.collectionId);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<null | number>(null);
  
  const onFocus = React.useCallback((event: React.FocusEvent<Element>) => {
    const target = event.target;
    // The following relies on the following attributes being correctly set on the item:
    // - `data-bk-coll-parent` is the parent collection ID
    // - `data-index` is the item index in the virtual list
    if (!(target instanceof HTMLElement) || target.dataset.bkCollParent !== id) { return; }
    const index = Number(target.dataset.index);
    
    if (!Number.isNaN(index)) {
      setFocusedItemIndex(index);
    }
  }, [id]);
  
  const onBlur = React.useCallback((event: React.FocusEvent<Element>) => {
    // Only clear once focus actually leaves the list entirely,
    // not when it moves between items inside it.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedItemIndex(null);
    }
  }, []);
  
  return {
    props: { onFocus, onBlur },
    focusedItemIndex,
  };
};


type ListBoxVirtualListProps = {
  status: NonNullable<React.ComponentProps<typeof ListBox>['status']>,
  placeholderEmpty?: undefined | false | React.ReactNode,
  scrollElement: null | React.ComponentRef<typeof ListBox>,
  virtualItemKeys: VirtualItemKeys,
  limit: number,
  pageSize?: undefined | number,
  hasMoreItems?: undefined | boolean,
  onLimitChange?: undefined | ((limit: number) => void),
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
    onLimitChange,
    status,
    placeholderEmpty = 'No items',
    renderItem,
    formatItemLabel,
    loadMoreItemsTriggerType = 'scroll',
    loadMoreItemsTrigger,
  } = props;
  const isLoading = status === 'loading';
  
  
  // TEMP
  // const { store } = useListBoxContext();
  // React.useEffect(() => {
  //   if (virtualItemKeys) {
  //     const state = store.getState();
  //     for (let i = 0; i < virtualItemKeys.length; i++) {
  //       state.unregisterItem(`item-${i}`);
  //       state.registerItem(`item-${i}`, null);
  //     }
  //     console.log('x', state.getItemKeys());
  //   }
  // }, [store, virtualItemKeys]);
  
  
  const { focusedItemIndex, props: focusProps } = useFocusedItemIndex();
  
  // Range extractor for `useVirtualizer` that always includes the focused item, if there is one. This is so that we
  // do not "lose" the focused item when it gets scrolled out of view (for accessibility).
  const rangeExtractorWithFocused = React.useCallback((range: Range) => {
    // For an example, see: https://tanstack.com/virtual/latest/docs/framework/react/examples/sticky?panel=code
    const indices: Array<number> = defaultRangeExtractor(range);
    
    // Note: the array must be deduplicated (otherwise we get the same item rendered multiple times), and it must
    // also be sorted (otherwise focus scroll into view becomes buggy).
    const indicesWithFocused = Array
      .from(new Set([
        0, // First item
        ...(typeof focusedItemIndex === 'number' ? [
          Math.max(0, focusedItemIndex - 1), // Previous item (for arrow navigation backwards)
          focusedItemIndex,
          Math.min(virtualItemKeys.length - 1, focusedItemIndex + 1), // Next item (for arrow navigation forwards)
        ] : []),
        virtualItemKeys.length - 1, // Last item
        ...indices,
      ]))
      .sort((index1, index2) => index1 - index2);
    
    return indicesWithFocused;
  }, [focusedItemIndex, virtualItemKeys.length]);
  
  const getItemKey = React.useCallback((index: number) => {
    const virtualItemKey = virtualItemKeys.at(index);
    return virtualItemKey ?? `__INVALID-INDEX_${index}`;
  }, [virtualItemKeys]);
  
  const isEmpty = useListBoxSelector(state => state.getItemKeys().size === 0);
  
  const virtualizer = useVirtualizer({
    //debug: true,
    count: virtualItemKeys.length,
    getScrollElement: () => scrollElement,
    getItemKey,
    estimateSize: () => 36,
    //directDomUpdates: true,
    overscan: 15,
    rangeExtractor: rangeExtractorWithFocused,
    horizontal: false, // FIXME: what about other `writing-mode` values?
    useScrollendEvent: true,
  });
  
  const virtualItems = virtualizer.getVirtualItems();
  const scrollNearEnd = isScrollNearEnd(virtualizer);
  
  React.useEffect(() => {
    if (loadMoreItemsTriggerType === 'scroll'
      && hasMoreItems
      && scrollNearEnd
      && !isLoading
    ) {
      onLimitChange?.(limit + pageSize);
    }
  }, [
    scrollNearEnd,
    hasMoreItems,
    isLoading,
    onLimitChange,
    limit,
    pageSize,
    loadMoreItemsTriggerType,
  ]);
  
  const renderLoadingSpinner = () => {
    return <PlaceholderLoading className={cx(cl['bk-list-box-lazy__item'])}/>;
  };
  
  const renderScrollTrigger = () => {
    return isLoading ? renderLoadingSpinner() : null;
  };
  
  const renderCustomTrigger = () => {
    if (!loadMoreItemsTrigger) { return null; }
    
    return (
      <div
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
        //ref={virtualizer.containerRef} // Needed when `directDomUpdates` is true
        {...focusProps}
        className={cx(cl['bk-list-box-lazy__scroller'])}
        style={{
          blockSize: virtualizer.getTotalSize(),
          //overflowAnchor: 'none',
        }}
      >
        {virtualItems.map((virtualItem) =>
          <ListItemVirtual
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            virtualItem={virtualItem}
            itemsCount={virtualItemKeys.length}
            renderItem={renderItem}
            formatItemLabel={formatItemLabel}
          />
        )}
      </div>
      
      {isEmpty && placeholderEmpty !== false && !isLoading &&
        <PlaceholderEmpty>{placeholderEmpty}</PlaceholderEmpty>
      }
      
      {loadMoreItemsTriggerType === 'scroll' && renderScrollTrigger()}
      {loadMoreItemsTriggerType === 'custom' && renderCustomTrigger()}
    </>
  );
};

/**
 * A list box component that renders its items lazily.
 */
export type ListBoxLazyProps = Omit<ComponentProps<typeof ListBox>, 'children'> & {
  /** The full list of item keys (possibly dynamically computed). */
  virtualItemKeys: VirtualItemKeys,
  
  /** The maximum number of items to load. */
  limit: ListBoxVirtualListProps['limit'],
  
  /** Size of a page (set of additional data to load in). Default: `10`. */
  pageSize?: undefined | ListBoxVirtualListProps['pageSize'],
  
  /** Whether there are more items, to be loaded. Default: `false`. */
  hasMoreItems?: undefined | ListBoxVirtualListProps['hasMoreItems'],
  
  /** Request to update the limit. */
  onLimitChange?: undefined | ListBoxVirtualListProps['onLimitChange'],
  /** Alias for `onLimitChange`. @deprecated */
  onUpdateLimit?: undefined | ListBoxVirtualListProps['onLimitChange'],
  
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
    selected,
    defaultSelected,
    onSelectedChange,
    virtualItemKeys,
    limit,
    pageSize = 10,
    hasMoreItems = false,
    onLimitChange,
    onUpdateLimit,
    status = 'ready',
    placeholderEmpty,
    renderItem,
    formatItemLabel,
    loadMoreItemsTriggerType,
    loadMoreItemsTrigger,
    ...propsRest
  } = props;
  
  // Note: we need to store the `scrollElement` in state, rather than passing it as a ref. This is because the `ref`
  // is a parent element but `useVirtualizer` is used in the child. Without state the inner component won't re-render.
  const [scrollElement, setScrollElement] = React.useState<null | React.ComponentRef<typeof ListBox>>(null);
  const listBoxRef = (element: React.ComponentRef<typeof ListBox>) => { setScrollElement(element); };
  
  const stateProps = { selected, defaultSelected, onSelectedChange } as SelectedStateProps;
  
  return (
    <ListBox
      {...propsRest}
      ref={mergeRefs(listBoxRef, propsRest.ref)}
      className={cx(
        { [cl['bk-list-box-lazy']]: !unstyled },
        propsRest.className,
      )}
      {...stateProps}
      formatItemLabel={formatItemLabel}
      placeholderEmpty={null}
    >
      <ListBoxVirtualList
        scrollElement={scrollElement}
        status={status}
        placeholderEmpty={placeholderEmpty}
        virtualItemKeys={virtualItemKeys}
        limit={limit}
        pageSize={pageSize}
        hasMoreItems={hasMoreItems}
        onLimitChange={onLimitChange ?? onUpdateLimit}
        renderItem={renderItem}
        formatItemLabel={formatItemLabel}
        loadMoreItemsTriggerType={loadMoreItemsTriggerType}
        loadMoreItemsTrigger={loadMoreItemsTrigger}
      />
    </ListBox>
  );
};
