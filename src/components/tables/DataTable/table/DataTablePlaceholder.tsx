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
