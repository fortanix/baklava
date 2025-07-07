/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ClassNameArgument, ComponentPropsWithoutRef } from '../../../../util/component_util.tsx';

import { type IconKey, isIconKey, BaklavaIcon } from '../../../icons/icon-pack-baklava/BaklavaIcon.tsx';

import { BaklavaIconDecorated } from '../../../icons/icon-pack-baklava/BaklavaIconDecorated.tsx';

import './DataTablePlaceholder.scss';


type DataTablePlaceholderProps = ComponentPropsWithoutRef<'div'> & {
  icon?: IconKey | React.ReactNode,
  classNameIcon?: ClassNameArgument,
  classNameMessage?: ClassNameArgument,
  classNameActions?: ClassNameArgument,
  placeholderMessage: React.ReactNode,
  actions?: React.ReactNode,
};
export const DataTablePlaceholder = (props: DataTablePlaceholderProps) => {
  const { icon, classNameIcon, classNameMessage, classNameActions, placeholderMessage, actions, ...propsRest } = props;
  
  const renderStandardIcon = (icon: React.ComponentPropsWithRef<typeof BaklavaIcon>['icon']): React.ReactNode => {
    return (
      <BaklavaIconDecorated border icon={icon} className={cx('bkl-table-placeholder__icon', classNameIcon)}/>
    );
  };
  
  const renderIcon = (): React.ReactNode => {
    if (typeof icon === 'undefined') {
      return renderStandardIcon('view-type-table');
    } else if (typeof icon === 'string') {
      if (isIconKey(icon)) {
        return renderStandardIcon(icon);
      } else {
        throw new Error(`Invalid icon ${icon}`);
      }
    } else {
      return icon;
    }
  };
  
  return (
    <div {...propsRest} className={cx('bkl-table-placeholder', propsRest.className)}>
      {renderIcon()}
      
      <p className={cx('bkl-table-placeholder__message', classNameMessage)}>
        {placeholderMessage}
      </p>
      
      {actions &&
        <p className={cx('bkl-table-placeholder__actions', classNameActions)}>
          {actions}
        </p>
      }
    </div>
  );
};
DataTablePlaceholder.displayName = 'DataTablePlaceholder';


// Loading skeleton (when there's no data to show yet)
type DataTablePlaceholderSkeletonProps = { className?: ClassNameArgument };
export const DataTablePlaceholderSkeleton = (props: DataTablePlaceholderSkeletonProps) => {
  return (
    <div className={cx('bkl-table-placeholder bkl-table-placeholder--skeleton', props.className)}>
      {Array.from({ length: 6 }).map((_, index) =>
        <span key={index} className="skeleton-row"/>, // eslint-disable-line react/no-array-index-key
      )}
    </div>
  );
};
DataTablePlaceholderSkeleton.displayName = 'DataTablePlaceholderSkeleton';


// Empty table (ready but no data)
type DataTablePlaceholderEmptyProps = Omit<DataTablePlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: DataTablePlaceholderProps['placeholder'],
};
export const DataTablePlaceholderEmpty = (props: DataTablePlaceholderEmptyProps) => {
  return (
    <DataTablePlaceholder
      placeholderMessage="No items"
      {...props}
      className={cx('bkl-table-placeholder--empty', props.className)}
    />
  );
};
DataTablePlaceholderEmpty.displayName = 'DataTablePlaceholderEmpty';


type DataTableErrorIconProps = Omit<React.ComponentPropsWithoutRef<typeof BaklavaIconDecorated>, 'icon'> & {
  icon?: React.ComponentPropsWithoutRef<typeof BaklavaIconDecorated>['icon'],
};
export const DataTableErrorIcon = (props: DataTableErrorIconProps) => {
  return (
    <div className="bkl-table-placeholder--error__error-icon">
      <BaklavaIcon icon="cross" className="icon-cross"/>
      <BaklavaIconDecorated border icon="view-type-table"
        {...props}
        className={cx('bkl-table-placeholder__icon', props.className)}
      />
    </div>
  );
};
DataTableErrorIcon.displayName = 'DataTableErrorIcon';

type DataTablePlaceholderErrorProps = Omit<DataTablePlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: React.ComponentPropsWithoutRef<typeof DataTablePlaceholder>['placeholder'],
};
export const DataTablePlaceholderError = (props: DataTablePlaceholderErrorProps) => {
  return (
    <DataTablePlaceholder
      icon={<DataTableErrorIcon/>}
      placeholderMessage="Failed to load items"
      {...props}
      className={cx('bkl-table-placeholder--error', props.className)}
    />
  );
};
DataTablePlaceholderError.displayName = 'DataTablePlaceholderError';


type DataTableRowPlaceholderProps = ComponentPropsWithoutRef<'div'> & {
  icon?: IconKey | React.ReactNode,
  classNameIcon?: ClassNameArgument,
  classNameMessage?: ClassNameArgument,
  classNameActions?: ClassNameArgument,
  placeholderMessage: React.ReactNode,
  actions?: React.ReactNode,
};
export const DataTableRowPlaceholder = (props: DataTableRowPlaceholderProps) => {
  const { icon, classNameIcon, classNameMessage, classNameActions, placeholderMessage, actions, ...propsRest } = props;
  
  const renderStandardIcon = (icon: React.ComponentPropsWithRef<typeof BaklavaIcon>['icon']): React.ReactNode => {
    return (
      <BaklavaIconDecorated icon={icon} className={cx('bkl-table-row-placeholder__icon', classNameIcon)}/>
    );
  };
  
  const renderIcon = (): React.ReactNode => {
    if (typeof icon === 'undefined') {
      return renderStandardIcon('event-warning');
    } else if (typeof icon === 'string') {
      if (isIconKey(icon)) {
        return renderStandardIcon(icon);
      } else {
        throw new Error(`Invalid icon ${icon}`);
      }
    } else {
      return icon;
    }
  };
  
  return (
    <div {...propsRest} className={cx('bkl-table-row-placeholder', propsRest.className)}>
      {renderIcon()}
      
      <p className={cx('bkl-table-row-placeholder__message', classNameMessage)}>
        {placeholderMessage}
      </p>
      
      {actions &&
        <p className={cx('bkl-table-row-placeholder__actions', classNameActions)}>
          {actions}
        </p>
      }
    </div>
  );
};
DataTableRowPlaceholder.displayName = 'DataTableRowPlaceholder';

type DataTablePlaceholderEndOfTableProps = Omit<DataTableRowPlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: React.ReactNode,
};

export const DataTablePlaceholderEndOfTable = (props: DataTablePlaceholderEndOfTableProps) => {
  return (
    <DataTableRowPlaceholder
      placeholderMessage="You have reached the end of the table"
      {...props}
      className={cx('bkl-table-row-placeholder--end-of-table', props.className)}
    />
  );
};
DataTablePlaceholderEndOfTable.displayName = 'DataTablePlaceholderEndOfTable';
