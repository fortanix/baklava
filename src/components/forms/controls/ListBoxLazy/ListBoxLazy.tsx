/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';

import { ListBoxContext, ListBox } from '../ListBox/ListBox.tsx';

import cl from './ListBoxLazy.module.scss';


export { cl as ListBoxLazyClassNames };

type ListBoxVirtualListProps = {
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  totalItems: number,
};
const ListBoxVirtualList = ({ virtualizer, totalItems }: ListBoxVirtualListProps) => {
  const context = React.use(ListBoxContext);
  
  React.useEffect(() => {
    if (typeof context?.focusedItem !== 'number') { return; }
    const targetIndex: number = context.focusedItem >= 0 ? context.focusedItem : (context.focusedItem + totalItems);
    
    virtualizer.scrollToIndex(targetIndex);
  }, [context?.focusedItem, virtualizer, totalItems]);
  
  return (
    <div
      className={cx(cl['bk-list-box-lazy__scroller'])}
      style={{
        blockSize: virtualizer.getTotalSize(),
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <ListBox.Option
          key={virtualItem.key}
          itemKey={`option_${virtualItem.key}`}
          itemPos={virtualItem.index}
          label={`Row ${virtualItem.index + 1}`}
          aria-setsize={totalItems}
          className={cx(cl['bk-list-box-lazy__item'])}
          style={{
            blockSize: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`, // FIXME: logical property equivalent?
          }}
        />
      ))}
    </div>
  );
};

export type ListBoxLazyProps = Omit<ComponentProps<typeof ListBox>, 'children'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * A list box component that renders its items lazily.
 */
export const ListBoxLazy = (props: ListBoxLazyProps) => {
  const { unstyled = false, ...propsRest } = props;
  
  const listBoxRef = React.useRef<React.ComponentRef<typeof ListBox>>(null);
  
  const count = 100_000;
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => listBoxRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });
  
  return (
    <ListBox
      {...propsRest}
      ref={mergeRefs(listBoxRef, props.ref)}
      className={cx(
        'bk',
        { [cl['bk-list-box-lazy']]: !unstyled },
        propsRest.className,
      )}
      totalItems={count}
    >
      <ListBoxVirtualList virtualizer={virtualizer} totalItems={count}/>
    </ListBox>
  );
};
