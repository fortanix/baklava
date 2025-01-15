/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';
import { type IconName, isIconName, Icon, type IconProps } from '../../../graphics/Icon/Icon.tsx';
import { PlaceholderEmpty, type PlaceholderEmptyProps } from '../../../graphics/PlaceholderEmpty/PlaceholderEmpty.tsx';
import { useTable } from '../DataTableContext.tsx';

export {
  PlaceholderEmptyAction,
} from '../../../graphics/PlaceholderEmpty/PlaceholderEmpty.tsx';

import './DataTablePlaceholder.scss';


// Loading skeleton (when there's no data to show yet)
type DataTablePlaceholderSkeletonProps = { className?: ClassNameArgument };
export const DataTablePlaceholderSkeleton = (props: DataTablePlaceholderSkeletonProps) => {
  const { table } = useTable();
  return (
    <div className={cx('bk-table-placeholder bk-table-placeholder--skeleton', props.className)}>
      {Array.from({ length: 6 }).map((_, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
        <span key={index} className="skeleton-row">
          {table.visibleColumns.map((col, index) =>
            // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
            <span key={index} className={cx("skeleton-cell", `skeleton-cell__${col.id}`)} />
          )}
        </span>,
      )}
    </div>
  );
};

// Empty table (ready but no data)
type DataTablePlaceholderEmptyProps = Omit<PlaceholderEmptyProps, 'title'> & {
  // Make `placeholderMessage` optional
  title?: PlaceholderEmptyProps['title'],
};
export const DataTablePlaceholderEmpty = (props: DataTablePlaceholderEmptyProps) => {
  return (
    <PlaceholderEmpty
      title="No items"
      {...props}
      className={cx('bk-table-placeholder bk-table-placeholder--empty', props.className)}
    />
  );
};

type DataTablePlaceholderErrorProps = Omit<PlaceholderEmptyProps, 'title'> & {
  // Make `placeholderMessage` optional
  title?: React.ComponentProps<typeof PlaceholderEmpty>['title'],
};
export const DataTablePlaceholderError = (props: DataTablePlaceholderErrorProps) => {
  return (
    <PlaceholderEmpty
      title="Failed to load items"
      {...props}
      className={cx('bk-table-placeholder bk-table-placeholder--error', props.className)}
    />
  );
};


type DataTableRowPlaceholderProps = ComponentProps<'div'> & {
  icon?: IconName | React.ReactNode,
  classNameIcon?: ClassNameArgument,
  classNameMessage?: ClassNameArgument,
  classNameActions?: ClassNameArgument,
  placeholderMessage: React.ReactNode,
  actions?: React.ReactNode,
};
export const DataTableRowPlaceholder = (props: DataTableRowPlaceholderProps) => {
  const { icon, classNameIcon, classNameMessage, classNameActions, placeholderMessage, actions, ...propsRest } = props;
  
  const renderStandardIcon = (icon: IconProps['icon']): React.ReactNode => {
    return (
      <Icon icon={icon} className={cx('bk-table-row-placeholder__icon', classNameIcon)} />
    );
  };
  
  const renderIcon = (): React.ReactNode => {
    if (typeof icon === 'undefined') {
      return renderStandardIcon('warning');
    }
    if (typeof icon === 'string') {
      if (isIconName(icon)) {
        return renderStandardIcon(icon);
      }
      throw new Error(`Invalid icon ${icon}`);
    }
    return icon;
  };
  
  return (
    <div {...propsRest} className={cx('bk-table-row-placeholder', propsRest.className)}>
      {renderIcon()}
      
      <p className={cx('bk-table-row-placeholder__message', classNameMessage)}>
        {placeholderMessage}
      </p>
      
      {actions &&
        <p className={cx('bk-table-row-placeholder__actions', classNameActions)}>
          {actions}
        </p>
      }
    </div>
  );
};

type DataTablePlaceholderEndOfTableProps = Omit<DataTableRowPlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: React.ReactNode,
};

export const DataTablePlaceholderEndOfTable = (props: DataTablePlaceholderEndOfTableProps) => {
  return (
    <DataTableRowPlaceholder
      placeholderMessage="You have reached the end of the table"
      {...props}
      className={cx('bk-table-row-placeholder--end-of-table', props.className)}
    />
  );
};
