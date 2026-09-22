/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RequireOnly, PartialKeys } from '../../../util/types.ts';
import * as React from 'react';
import { mergeRefs, mergeProps } from '../../../util/reactUtil.ts';
import { type ComponentProps } from '../../../util/componentUtil.ts';

import {
  type Range,
  defaultRangeExtractor,
  type VirtualItem as BaseVirtualItem,
  type Virtualizer as BaseVirtualizer,
  useVirtualizer,
} from '@tanstack/react-virtual';

import { type MenuListProps, MenuListSegment } from './MenuList.tsx';

import cl from './MenuListSegmentVirtual.module.scss';


export { cl as MenuListVirtualClassNames };

const noop = () => {};
type MenuListRef = React.ComponentRef<React.FunctionComponent<MenuListProps>>;

/*
Limitations of using virtualization:
- Scroller must have explicit width/height, cannot be dynamically sized based on the content.
- Lack of searchability (CTRL/CMD+F).
*/

type VirtualizerOptions = Parameters<typeof useVirtualizer>[0];
type Virtualizer = BaseVirtualizer<Element, Element>;

export type VirtualItem = BaseVirtualItem & {
  indexAbsolute: number,
};
export type VirtualItemProps = {
  style: React.ComponentProps<'div'>['style'],
  className: React.ComponentProps<'div'>['className'],
  'data-index': number,
  'aria-setsize': number,
  'aria-posinset': number,
};
export type VirtualItemsChunk = {
  /** The number of items to render in this chunk. */
  count: number,
  /**
   * How to render this chunk:
   * - `lazy`: the items will be virtualized (only rendered when visible, or nearly visible).
   * - `always`: the items will always be rendered even when not visible.
   * Default: `'lazy'`.
   */
  renderMode?: undefined | 'lazy' | 'always',
  /**
   * Optionally, a map from the given item index (relative to the chunk) to a unique item key. If not given, the
   * index itself will serve as the key (may lead to less efficient rendering if items are rearranged).
   */
  getItemKey?: (index: number) => VirtualItem['key'],
  renderItem: (props: VirtualItemProps, virtualItem: VirtualItem) => React.ReactNode,
  estimateSize: (index: number) => number,
};


//
// Range extractor
//

const useFocusedItemIndex = () => {
  // IDEA: instead of doing this DOM-based query, inject `onFocus`/`onBlur` on the virtual items directly
  
  //const collId = useListBoxSelector(state => state.collectionId);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<null | number>(null);
  
  const onFocus = React.useCallback((index: number) => (event: React.FocusEvent<Element>) => {
    // Note: this assumes (1) that the item element itself is the focusable element, and (2) that there aren't
    // focusable elements _within_ the item.
    if (event.target === event.currentTarget) {
      //console.log('focus', index, event);
      setFocusedItemIndex(index);
    }
    return;
    /*
    const target = event.target;
    // The following relies on the following attributes being correctly set on the item:
    // - `data-bk-coll-${collId}-item` is present
    // - `data-index` is the item index in the virtual list
    if (
      !(target instanceof HTMLElement)
      || typeof target.getAttribute(`data-bk-coll-${collId}-item`) !== 'string'
    ) {
      return;
    }
    const index = Number(target.dataset.index);
    
    if (!Number.isNaN(index)) {
      setFocusedItemIndex(index);
    }
    */
  }, []);
  
  const onBlur = React.useCallback((index: number) => (event: React.FocusEvent<Element>) => {
    // Only clear once focus actually leaves the list entirely,
    // not when it moves between items inside it.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      //setFocusedItemIndex(null); // FIXME: breaks focus tracking when item is off screen
    }
  }, []);
  
  // FIXME: useCallback is useless if we create the `onFocus(index)` closure here, might as well inline them
  return {
    props: (index: number) => ({ onFocus: onFocus(index), onBlur: onBlur(index) }),
    focusedItemIndex,
  };
};

// Range extractor for `useVirtualizer` that always includes the focused item, if there is one. This is so that we
// do not "lose" the focused item when it gets scrolled out of view (for accessibility).
const rangeExtractorWithFocused = (
  virtualItemKeysCount: number,
  indicesAlwaysRendered: Set<number>,
  focusedItemIndex: null | number,
) => {
  return (range: Range) => {
    // For an example, see: https://tanstack.com/virtual/latest/docs/framework/react/examples/sticky?panel=code
    const indicesDefault: Array<number> = defaultRangeExtractor(range);
    
    // Note: the array must be deduplicated (otherwise we get the same item rendered multiple times), and it must
    // also be sorted (otherwise focus scroll into view becomes buggy).
    const indicesWithFocused = Array
      .from(new Set([
        0, // First item
        ...(typeof focusedItemIndex === 'number' ? [
          Math.max(0, focusedItemIndex - 1), // Previous item (for arrow navigation backwards)
          focusedItemIndex, // Currently focused item
          Math.min(virtualItemKeysCount - 1, focusedItemIndex + 1), // Next item (for arrow navigation forwards)
        ] : []),
        virtualItemKeysCount - 1, // Last item
        ...indicesAlwaysRendered,
        ...indicesDefault,
      ]))
      .sort((index1, index2) => index1 - index2);
    
    return indicesWithFocused;
  };
};


//
// Virtualizer
//

type ChunkLookupResult = {
  /** The absolute index (in the total list) at which this chunk starts. */
  startIndex: number,
  /** The index of the chunk (within the list of chunks) for the found chunk. */
  chunkIndex: number,
  /** The found chunk. */
  chunk: VirtualItemsChunk,
};
/** Create an efficient lookup from an item index to the corresponding chunk. */
const createChunkLookup = (chunks: Array<VirtualItemsChunk>) => {
  // Preprocessing
  let itemsTotal = 0; // Total items across all chunks
  const ends = new Array(chunks.length); // The end index for each chunk
  for (const [i, chunk] of chunks.entries()) {
    itemsTotal += chunk.count;
    ends[i] = itemsTotal;
  }
  
  // Take an item index, and return the corresponding chunk details (or `null` if out of range)
  return (itemIndex: number): null | ChunkLookupResult => {
    if (itemIndex < 0 || itemIndex >= itemsTotal) { return null; }
    
    // Given `ends`, find the chunk containing `itemIndex` using binary search
    let lo = 0;
    let hi = ends.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      // biome-ignore lint/style/noNonNullAssertion: `mid` is guaranteed to be in the array (in between `lo`/`hi`)
      if (ends[mid]! <= itemIndex) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    
    const startIndex = ends[lo - 1] ?? 0;
    // biome-ignore lint/style/noNonNullAssertion: `lo` is guaranteed to be in `chunks`
    const foundChunk = chunks[lo]!;
    return { startIndex, chunkIndex: lo, chunk: foundChunk };
  };
};

type UseMenuListVirtualizerOptions = PartialKeys<VirtualizerOptions, 'count' | 'estimateSize'>;
/** Create a `Virtualizer` instance given an array of menu list chunks. */
const useMenuListVirtualizer = (chunks: Array<VirtualItemsChunk>, options: UseMenuListVirtualizerOptions) => {
  const chunkForIndex = createChunkLookup(chunks);
  
  type AggregatedOptions = RequireOnly<VirtualizerOptions, 'count' | 'estimateSize'> & {
    indicesAlwaysRendered: Set<number>,
  };
  const aggregatedOptions = chunks.reduce<AggregatedOptions>(
    (acc, chunk) => {
      // Keep track of the indices that we should always render (i.e. skip virtualization)
      if (chunk.renderMode === 'always') {
        const start = acc.count;
        const end = start + chunk.count;
        for (const rangeIndex of Array.from({ length: end - start }, (v, k) => k + start)) {
          acc.indicesAlwaysRendered.add(rangeIndex);
        }
      }
      return Object.assign(acc, {
        count: acc.count + chunk.count,
      });
    },
    {
      count: 0,
      indicesAlwaysRendered: new Set(),
      
      getItemKey: index => {
        const result = chunkForIndex(index);
        if (result === null) { return `__UNKNOWN_INDEX_${index}`; } // Should never happen
        
        const { startIndex, chunk } = result;
        const indexRelative = index - startIndex;
        
        // Note: if we want to ensure that `key` is globally unique (including user-defined `getItemKey`), we could do
        // something like the following. However, this is not necessary as long as we render each chunk as its own
        // array in the VDOM. (Which is preferable, otherwise we would have to do "undo" to get the original key later.)
        //return `c${chunkIndex}_${key}`;
        
        return chunk.getItemKey?.(indexRelative) ?? index;
      },
      estimateSize: index => {
        const result = chunkForIndex(index);
        if (result === null) { return 0; } // Should never happen
        
        const { startIndex, chunk } = result;
        const indexRelative = index - startIndex;
        return chunk.estimateSize(indexRelative);
      },
    } satisfies AggregatedOptions,
  );
  
  const { focusedItemIndex, props: focusPropsFor } = useFocusedItemIndex(); // Track the item that has focus (if any)
  
  // Custom range extractor that keeps into account the currently focused item (for keyboard navigation)
  const rangeExtractor = React.useMemo(
    () => rangeExtractorWithFocused(aggregatedOptions.count, aggregatedOptions.indicesAlwaysRendered, focusedItemIndex),
    [aggregatedOptions.count, aggregatedOptions.indicesAlwaysRendered, focusedItemIndex],
  );
  
  const virtualizer = useVirtualizer({
    ...aggregatedOptions,
    rangeExtractor,
    ...options,
  });
  
  return {
    virtualizer,
    renderItem: (index: number, props: VirtualItemProps, virtualItem: VirtualItem) => {
      const chunkResult = chunkForIndex(index);
      if (chunkResult === null) { return null; }
      
      const itemProps = mergeProps(props, focusPropsFor(index));
      return chunkResult.chunk.renderItem(itemProps, virtualItem);
    },
    getVirtualItemChunks() {
      const virtualItemChunks = new Map<number, { chunk: VirtualItemsChunk, virtualItems: Array<VirtualItem> }>();
      
      const virtualItems = virtualizer.getVirtualItems();
      for (const baseVirtualItem of virtualItems) {
        const chunkResult = chunkForIndex(baseVirtualItem.index);
        if (chunkResult === null) { continue; }
        
        const virtualItem: VirtualItem = {
          ...baseVirtualItem,
          index: baseVirtualItem.index - chunkResult.startIndex, // Use the local chunk index by default
          indexAbsolute: baseVirtualItem.index, // Also make the absolute index available in the rare case it's needed
        };
        
        const itemChunk = virtualItemChunks
          .getOrInsert(chunkResult.chunkIndex, { chunk: chunkResult.chunk, virtualItems: [] });
        itemChunk.virtualItems.push(virtualItem);
      }
      
      return virtualItemChunks.values().toArray();
    },
  };
};

/*
// Given a virtualizer, determine if the user is near the end of the scroll container
const hasScrolledNearEnd = (virtualizer: Virtualizer): boolean => {
  const scrollRectHeight = virtualizer.scrollRect?.height ?? null;
  if (virtualizer.scrollOffset === null || scrollRectHeight === null) { return false; }
  
  const distanceFromEnd = virtualizer.getTotalSize() - (virtualizer.scrollOffset + scrollRectHeight);
  return distanceFromEnd < (scrollRectHeight / 2);
};
*/

type UseScrollNearEndTrackerParams = {
  virtualizer: Virtualizer,
  onNearEnd: () => void,
};
const useNearEndTracker = ({ virtualizer, onNearEnd }: UseScrollNearEndTrackerParams) => {
  //const isNearEnd = hasScrolledNearEnd(virtualizer);
  const isNearEnd = virtualizer.isAtEnd(0); // FIXME: up this to something like 100
  const totalItems = virtualizer.getVirtualItems().length; // FIXME: may need to subtract placeholders (e.g. loading)
  
  // FIXME: during the first render, even if there are items, `totalItems` will be 0 and it will trigger `onNearEnd`.
  // Idea: `useState` to track whether `totalItems` was ever non-zero and only then do this check? However, what if the
  // list is indeed empty, should we still count isNearEnd for actually empty lists?
  
  //console.log('x', isNearEnd, totalItems);
  const onNearEndEvent = React.useEffectEvent(onNearEnd);
  // Note: if `totalItems` changes and `isNearEnd` is still true, we should again notify the consumer.
  // biome-ignore lint/correctness/useExhaustiveDependencies(totalItems): See above.
  React.useEffect(() => {
    if (isNearEnd) {
      onNearEndEvent();
    }
  }, [isNearEnd, totalItems]);
};

const useMenuListScrollContainer = () => {
  // TODO: instead of direct DOM query we could do this through `MenuListContext` instead. However, we'd need to take
  // into account the scenario where the nearest `MenuListContext` is for an embedded `MenuList`. In other words, the
  // context will need to recursive (each using its own context until a scroller is found).
  
  const [scrollContainer, setScrollContainer] = React.useState<null | MenuListRef>(null);
  const ref = React.useCallback<React.RefCallback<React.ComponentRef<typeof MenuListSegmentVirtual>>>(el => {
    if (!el) { return; }
    const scrollContainer = el.closest('[data-bk-menu-list-scroller]');
    if (scrollContainer) {
      setScrollContainer(scrollContainer as MenuListRef);
    }
  }, []);
  
  return { trackScrollContainerRef: ref, scrollContainer };
};

export type MenuListSegmentVirtualProps = Omit<ComponentProps<typeof MenuListSegment>, 'children'> & {
  /** The descriptor for the virtual items to render. */
  items: VirtualItemsChunk | Array<VirtualItemsChunk>,
  
  /** Callback that is called when the user scrolls near the end of the virtualized list. */
  onNearEnd?: undefined | (() => void),
};
export const MenuListSegmentVirtual = (props: MenuListSegmentVirtualProps) => {
  const { items, onNearEnd, ...propsRest } = props;
  
  const itemsNormalized: Array<VirtualItemsChunk> = Array.isArray(items) ? items : [items];
  
  const { trackScrollContainerRef, scrollContainer } = useMenuListScrollContainer();
  
  const contentContainerRef = React.useRef<React.ComponentRef<typeof MenuListSegment>>(null);
  const getContentContainerOffset = React.useCallback(() => {
    if (!scrollContainer || !contentContainerRef.current) { return 0; }
    
    const scrollContainerRect = scrollContainer.getBoundingClientRect();
    const contentRect = contentContainerRef.current.getBoundingClientRect();
    
    const style = getComputedStyle(scrollContainer);
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    
    return contentRect.top - scrollContainerRect.top - borderTop - paddingTop + scrollContainer.scrollTop;
  }, [scrollContainer]);
  
  const offset = getContentContainerOffset();
  // FIXME: this offset is not fully stable initially. Also, should we take into account the possibility of elements
  // resizing out of sync with the render cycle? Do we need a ResizeObserver?
  //console.log('x', offset, scrollContainer, contentContainerRef.current);
  
  
  const { virtualizer, getVirtualItemChunks, renderItem } = useMenuListVirtualizer(itemsNormalized, {
    //debug: true,
    //directDomUpdates: true,
    enabled: scrollContainer !== null,
    getScrollElement: () => scrollContainer,
    overscan: 15,
    horizontal: false, // FIXME: what about other `writing-mode` values?
    useScrollendEvent: true, // Opt in to modern browser support for `scrollend` events
    
    // FIXME: idea: keep track of the distance between the scroll container and the top of the virtual segment. Use
    // that as a `paddingStart` (and then compensate in the `blockSize` and `transformY`)
    paddingStart: offset,
  });
  useNearEndTracker({ virtualizer, onNearEnd: onNearEnd ?? noop });
  
  return (
    <MenuListSegment
      {...mergeProps(
        {
          // `trackScrollContainerRef` is used to track the nearest scroll container relative to this element)
          ref: mergeRefs(contentContainerRef, trackScrollContainerRef),
          className: cl['bk-menu-list-segment-virtual'],
          style: {
            blockSize: virtualizer.getTotalSize() - offset,
          },
        },
        propsRest,
      )}
    >
      {getVirtualItemChunks().map(({ chunk, virtualItems }) =>
        // Note: make sure each chunk is rendered as its own array in the virtual DOM, so that the `key` only needs
        // to be unique within a given chunk, not in the overall virtualized list.
        virtualItems.map(virtualItem =>
          renderItem(
            virtualItem.indexAbsolute,
            {
              //ref: virtualizer.measureElement, // NOTE: enabling this seems to introduce a lot of stuttering
              style: {
                transform: `translateY(${virtualItem.start - offset}px)`,
              },
              className: cl['bk-menu-list-segment-virtual__item'],
              'data-index': virtualItem.indexAbsolute,
              'aria-setsize': virtualizer.options.count,
              'aria-posinset': virtualItem.indexAbsolute + 1,
            },
            virtualItem,
          )
        ),
      )}
    </MenuListSegment>
  );
};
