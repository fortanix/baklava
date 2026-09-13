/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RequireOnly, PartialKeys } from '../../../util/types.ts';
import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import {
  //type Range,
  type VirtualItem,
  //type Virtualizer,
  //defaultRangeExtractor,
  useVirtualizer,
} from '@tanstack/react-virtual';

import { MenuList } from '../MenuList/MenuList.tsx';

import cl from './MenuListVirtual.module.scss';


export { cl as MenuListVirtualClassNames };

/*
Limitations of using virtualization:
- Scroller must have explicit width/height, cannot be dynamically sized based on the content.
- Lack of searchability (CTRL/CMD+F).
*/

type VirtualizerOptions = Parameters<typeof useVirtualizer>[0];

type VirtualItemsSegment = {
  /** The number of items to render in this segment. */
  count: number,
  /**
   * Optionally, a map from the given item index (relative to the segment) to a unique item key. If not given, the
   * index itself will serve as the key (may lead to less efficient rendering if items are rearranged).
   */
  getItemKey?: (index: number) => VirtualItem['key'],
  renderItem: (props: {}, virtualItem: VirtualItem) => React.ReactNode,
  estimateSize: (index: number) => number,
};

/** Create an efficient lookup from an item index to the corresponding segment. */
const createSegmentLookup = (segments: Array<VirtualItemsSegment>) => {
  // Preprocessing
  let itemsTotal = 0; // Total items across all segments
  const ends = new Array(segments.length); // The end index for each segment
  for (const [i, segment] of segments.entries()) {
    itemsTotal += segment.count;
    ends[i] = itemsTotal;
  }
  
  // Take an item index, and return the corresponding segment details (or `null` if out of range)
  return (itemIndex: number): null | { startIndex: number, segmentIndex: number, segment: VirtualItemsSegment } => {
    if (itemIndex < 0 || itemIndex >= itemsTotal) { return null; }
    
    // Given `ends`, find the segment containing `itemIndex` using binary search
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
    // biome-ignore lint/style/noNonNullAssertion: `lo` is guaranteed to be in `segments`
    const foundSegment = segments[lo]!;
    return { startIndex, segmentIndex: lo, segment: foundSegment };
  };
};

type UseMenuListVirtualizerOptions = PartialKeys<VirtualizerOptions, 'count' | 'estimateSize'>;
/** Create a `Virtualizer` instance given an array of menu list segments. */
const useMenuListVirtualizer = (segments: Array<VirtualItemsSegment>, options: UseMenuListVirtualizerOptions) => {
  const segmentForIndex = createSegmentLookup(segments);
  
  type AggregatedOptions = RequireOnly<VirtualizerOptions, 'count' | 'estimateSize'>;
  const aggregatedOptions = segments.reduce<AggregatedOptions>(
    (acc, segment) => {
      return Object.assign(acc, {
        count: acc.count + segment.count,
      });
    },
    {
      count: 0,
      getItemKey: index => {
        const result = segmentForIndex(index);
        if (result === null) { return `__UNKNOWN_INDEX_${index}`; }
        const { startIndex, segment } = result;
        const indexRelative = index - startIndex;
        return segment.getItemKey?.(indexRelative) ?? index;
      },
      estimateSize: index => {
        const result = segmentForIndex(index);
        if (result === null) { return 0; }
        const { startIndex, segment } = result;
        const indexRelative = index - startIndex;
        return segment.estimateSize(indexRelative);
      },
    } satisfies AggregatedOptions,
  );
  
  const virtualizer = useVirtualizer({
    ...aggregatedOptions,
    ...options,
  });
  
  return {
    virtualizer,
    renderItem: (index: number, props: {}, virtualItem: VirtualItem) => {
      const segmentResult = segmentForIndex(index);
      if (segmentResult === null) { return null; }
      return segmentResult.segment.renderItem(props, virtualItem);
    },
    getVirtualItemSegments() {
      const virtualItemSegments = new Map<number, { segment: VirtualItemsSegment, virtualItems: Array<VirtualItem> }>();
      
      const virtualItems = virtualizer.getVirtualItems();
      for (const virtualItem of virtualItems) {
        const segmentResult = segmentForIndex(virtualItem.index);
        if (segmentResult === null) { continue; }
        
        const itemSegment = virtualItemSegments
          .getOrInsert(segmentResult.segmentIndex, { segment: segmentResult.segment, virtualItems: [] });
        itemSegment.virtualItems.push(virtualItem);
      }
      
      return virtualItemSegments.values().toArray();
    },
  };
};

export type MenuListVirtualProps = Omit<ComponentProps<typeof MenuList>, 'children'> & {
  scrollContainer: React.RefObject<null | Element>,
  
  items: VirtualItemsSegment | Array<VirtualItemsSegment>,
};
export const MenuListVirtual = Object.assign(
  (props: MenuListVirtualProps) => {
    const { scrollContainer, items, ...propsRest } = props;
    
    const itemsNormalized: Array<VirtualItemsSegment> = Array.isArray(items) ? items : [items];
    
    const { virtualizer, getVirtualItemSegments, renderItem } = useMenuListVirtualizer(itemsNormalized, {
      //debug: true,
      getScrollElement: () => scrollContainer.current,
      //directDomUpdates: true,
      overscan: 15,
      //rangeExtractor: rangeExtractorWithFocused,
      horizontal: false, // FIXME: what about other `writing-mode` values?
      useScrollendEvent: true, // Opt in to modern browser support for `scrollend` events
    });
    
    return (
      <MenuList.Segment
        {...propsRest}
        className={cx(
          //{ [cl['bk-menu-list-virtual']]: !unstyled },
          propsRest.className,
        )}
        style={{
          position: 'relative',
          blockSize: virtualizer.getTotalSize(),
        }}
        // embedded
        // size="shrink"
        // empty={false}
        // placeholderEmpty={null}
      >
        {/* {getVirtualItemSegments().map(({ segment, virtualItems }, segmentIndex) =>
          // biome-ignore lint/suspicious/noArrayIndexKey: Segments do not have any other key
          <MenuListVirtual.Segment key={segmentIndex} {...segment.segmentProps}>
            {virtualItems.map(virtualItem =>
              renderItem(virtualItem.index, {
                ref: virtualizer.measureElement,
                style: {
                  position: 'absolute' as const,
                  top: 0,
                  left: 0,
                  inlineSize: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                },
                'data-index': virtualItem.index,
                'aria-setsize': virtualizer.options.count,
                'aria-posinset': virtualItem.index + 1,
              }, virtualItem)
            )}
          </MenuListVirtual.Segment>
        )} */}
        {getVirtualItemSegments().map(({ segment, virtualItems }) =>
          virtualItems.map(virtualItem =>
            renderItem(virtualItem.index, {
              ref: virtualizer.measureElement,
              style: {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                inlineSize: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              },
              'data-index': virtualItem.index,
              'aria-setsize': virtualizer.options.count,
              'aria-posinset': virtualItem.index + 1,
            }, virtualItem)
          ),
        )}
      </MenuList.Segment>
    );
  },
  {
    Segment: MenuList.Segment,
    Footer: MenuList.Footer,
    Group: MenuList.Group,
    Static: MenuList.Static,
    Action: MenuList.Action,
    Link: MenuList.Link,
    Option: MenuList.Option,
  },
);
