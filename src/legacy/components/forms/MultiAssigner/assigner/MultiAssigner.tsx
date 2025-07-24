/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { WithOptional } from '../../../../util/types.ts';

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../../util/component_util.tsx';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Button } from '../../../buttons/Button.tsx';
import { BaklavaIcon } from '../../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { SearchInput } from '../../../../prefab/forms/SearchInput/SearchInput.tsx';
import { Item, ItemKey, useMultiAssigner } from '../MultiAssignerContext.tsx';

import './MultiAssigner.scss';


export type MultiAssignerProps<T extends Item> = {
  deriveKey: (item: T) => ItemKey,
  
  items: Array<T>, // All items (selected or otherwise)
  assignedItemKeys: Array<ItemKey>,
  assignedItemsVirtualizerProps?: WithOptional<Parameters<typeof useVirtualizer>[0], 'count' | 'getScrollElement'>,
  unassignedItemsVirtualizerProps?: WithOptional<Parameters<typeof useVirtualizer>[0], 'count' | 'getScrollElement'>,
  
  assignItem: (itemKey: ItemKey) => void,
  unassignItem: (itemKey: ItemKey) => void,
  
  className?: ClassNameArgument,
  renderItemDetails: (itemKey: ItemKey) => React.ReactNode,
  renderAssignedItemDetails: (itemKey: ItemKey) => React.ReactNode,
  renderItemsHeader?: () => React.ReactNode,
  renderAssignedItemsHeader?: () => React.ReactNode,
  renderItemsPlaceholder?: () => React.ReactNode,
  renderAssignedItemsPlaceholder?: () => React.ReactNode,
  renderSearch?: () => React.ReactNode,
  renderLoadMoreItems?: () => React.ReactNode,
  renderLoadMoreAssignedItems?: () => React.ReactNode,
};
export const MultiAssigner = <T extends Item>(props: MultiAssignerProps<T>) => {
  const {
    deriveKey,
    items,
    assignedItemKeys,
    assignedItemsVirtualizerProps,
    unassignedItemsVirtualizerProps,
    className,
    assignItem,
    unassignItem,
    renderItemDetails,
    renderAssignedItemDetails,
    renderItemsHeader,
    renderAssignedItemsHeader,
    renderSearch,
    renderItemsPlaceholder,
    renderAssignedItemsPlaceholder,
    renderLoadMoreItems,
    renderLoadMoreAssignedItems,
  } = props;
  
  const assignedItemsParentRef = React.useRef(null);
  const unassignedItemsParentRef = React.useRef(null);
  
  // Filter `items` to just those that are not yet assigned
  const unassignedItems: Array<T> = items.filter(item =>
    !assignedItemKeys.some(assignedItemKey => assignedItemKey === deriveKey(item)),
  );
  
  const assignedItemsVirtualizer = useVirtualizer({
    count: assignedItemKeys.length,
    getScrollElement: () => assignedItemsParentRef.current,
    estimateSize: assignedItemsVirtualizerProps?.estimateSize ?? (() => 65),
    ...(assignedItemsVirtualizerProps ?? {}),
  });
  
  const unassignedItemsVirtualizer = useVirtualizer({
    count: unassignedItems.length,
    getScrollElement: () => unassignedItemsParentRef.current,
    estimateSize: unassignedItemsVirtualizerProps?.estimateSize ?? (() => 65),
    ...(unassignedItemsVirtualizerProps ?? {}),
  });
  
  return (
    <div className={cx('bkl bkl-multi-assigner', className)}>
      <div className="col col-1">
        <div className="col-header">
          {renderItemsHeader?.()}
          {renderSearch?.()}
        </div>
        <div ref={unassignedItemsParentRef} className="col-inner">
          {unassignedItems.length === 0 && renderItemsPlaceholder?.()}
          <div
            style={{
              height: `${unassignedItemsVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {unassignedItemsVirtualizer.getVirtualItems().map(virtualItem => {
              const item = unassignedItems[virtualItem.index];
              if (typeof item === 'undefined') { return null; }
              
              return (
                <Button
                  plain
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  key={deriveKey(item)}
                  className="item-container"
                  onClick={() => { assignItem(deriveKey(item)); }}
                >
                  {renderItemDetails(deriveKey(item))}
                </Button>
              );
            })}
          </div>
          {renderLoadMoreItems?.()}
        </div>
      </div>
      <div className="col col-2">
        <div className="col-header">
          {renderAssignedItemsHeader?.()}
        </div>
        <div ref={assignedItemsParentRef} className="col-inner">
          {assignedItemKeys.length === 0 && renderAssignedItemsPlaceholder?.()}
          <div
            style={{
              height: `${assignedItemsVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {assignedItemsVirtualizer.getVirtualItems().map(virtualItem => {
              const itemKey = assignedItemKeys[virtualItem.index];
              if (typeof itemKey === 'undefined') { return null; }
              
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  key={itemKey}
                  className="item-container"
                >
                  {renderAssignedItemDetails(itemKey)}
                </div>
              );
            })}
          </div>
          {renderLoadMoreAssignedItems?.()}
        </div>
      </div>
    </div>
  );
};

export type CardItemProps = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode,
};
export const CardItem = (props: CardItemProps) => {
  return (
    <div className={cx('card__item', props.className)}>
      {props.children}
    </div>
  );
};

export type CardItemTitleWrapperProps = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode,
};
export const CardItemTitleWrapper = (props: CardItemTitleWrapperProps) => {
  return (
    <div className={cx('card__item__title-wrapper', props.className)}>
      {props.children}
    </div>
  );
};

export type CardItemTitleProps = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode,
};
export const CardItemTitle = (props: CardItemTitleProps) => {
  return (
    <div className={cx('card__item__title', props.className)}>
      {props.children}
    </div>
  );
};

export type CardItemSubtitleProps = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode,
};
export const CardItemSubtitle = (props: CardItemSubtitleProps) => {
  return (
    <div className={cx('card__item__subtitle', props.className)}>
      {props.children}
    </div>
  );
};

export const Search = (props: React.ComponentPropsWithoutRef<typeof SearchInput>) => {
  return (
    <SearchInput type="text"
      onChange={props.onChange}
      {...props}
    />
  );
};

export type UnassignButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'children'> & {
  itemKey: ItemKey,
};
export const UnassignButton = (props: UnassignButtonProps) => {
  const { unassignItem } = useMultiAssigner();
  return (
    <Button
      {...props}
      className={cx('card__item__action button-unassign-item', props.className)}
      onClick={() => { unassignItem(props.itemKey); }}
    >
      <BaklavaIcon icon="cross-thin"/>
    </Button>
  );
};

export type AssignButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'children'> & {
  itemKey: ItemKey,
};
export const AssignButton = (props: AssignButtonProps) => {
  const { assignItem } = useMultiAssigner();
  return (
    <Button
      {...props}
      className={cx('card__item__action button-assign-item', props.className)}
      onClick={() => { assignItem(props.itemKey); }}
    >
      <BaklavaIcon icon="arrow-right"/>
    </Button>
  );
};
