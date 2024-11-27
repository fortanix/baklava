/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';
import { type IconName, isIconName, Icon, type IconProps } from '../../../graphics/Icon/Icon.tsx';

//import './DataTablePlaceholder.scss';


type DataTablePlaceholderProps = ComponentProps<'div'> & {
  icon?: IconName | React.ReactNode,
  classNameIcon?: ClassNameArgument,
  classNameMessage?: ClassNameArgument,
  classNameActions?: ClassNameArgument,
  placeholderMessage: React.ReactNode,
  actions?: React.ReactNode,
};
export const DataTablePlaceholder = (props: DataTablePlaceholderProps) => {
  const { icon, classNameIcon, classNameMessage, classNameActions, placeholderMessage, actions, ...propsRest } = props;
  
  const decoration = React.useMemo(() => ({ type: 'background-circle' } as const), []);
  const renderStandardIcon = (icon: IconProps['icon']): React.ReactNode => {
    return (
      <Icon decoration={decoration} icon={icon} className={cx('bk-table-placeholder__icon', classNameIcon)}/>
    );
  };
  
  const renderIcon = (): React.ReactNode => {
    if (typeof icon === 'string' && isIconName(icon)) {
      return renderStandardIcon(icon);
    }
    return renderStandardIcon('file');
  };
  
  return (
    <div {...propsRest} className={cx('bk-table-placeholder', propsRest.className)}>
      {renderIcon()}
      
      <p className={cx('bk-table-placeholder__message', classNameMessage)}>
        {placeholderMessage}
      </p>
      
      {actions &&
        <p className={cx('bk-table-placeholder__actions', classNameActions)}>
          {actions}
        </p>
      }
    </div>
  );
};


// Loading skeleton (when there's no data to show yet)
type DataTablePlaceholderSkeletonProps = { className?: ClassNameArgument };
export const DataTablePlaceholderSkeleton = (props: DataTablePlaceholderSkeletonProps) => {
  return (
    <div className={cx('bk-table-placeholder bk-table-placeholder--skeleton', props.className)}>
      {Array.from({ length: 6 }).map((_, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
        <span key={index} className="skeleton-row"/>,
      )}
    </div>
  );
};


// Empty table (ready but no data)
type DataTablePlaceholderEmptyProps = Omit<DataTablePlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: DataTablePlaceholderProps['placeholderMessage'],
};
export const DataTablePlaceholderEmpty = (props: DataTablePlaceholderEmptyProps) => {
  return (
    <DataTablePlaceholder
      placeholderMessage="No items"
      {...props}
      className={cx('bk-table-placeholder--empty', props.className)}
    />
  );
};


type DataTableErrorIconProps = Omit<IconProps, 'icon'> & {
  icon?: IconProps['icon'],
};
export const DataTableErrorIcon = (props: DataTableErrorIconProps) => {
  const decoration = React.useMemo(() => ({ type: 'background-circle' } as const), []);
  return (
    <div className="bk-table-placeholder--error__error-icon">
      <Icon icon="cross" className="icon-cross"/>
      <Icon decoration={decoration} icon="file"
        {...props}
        className={cx('bk-table-placeholder__icon', props.className)}
      />
    </div>
  );
};

type DataTablePlaceholderErrorProps = Omit<DataTablePlaceholderProps, 'placeholderMessage'> & {
  // Make `placeholderMessage` optional
  placeholderMessage?: React.ComponentProps<typeof DataTablePlaceholder>['placeholderMessage'],
};
export const DataTablePlaceholderError = (props: DataTablePlaceholderErrorProps) => {
  return (
    <DataTablePlaceholder
      icon={<DataTableErrorIcon/>}
      placeholderMessage="Failed to load items"
      {...props}
      className={cx('bk-table-placeholder--error', props.className)}
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
      <Icon icon={icon} className={cx('bk-table-row-placeholder__icon', classNameIcon)}/>
    );
  };
  
  const renderIcon = (): React.ReactNode => {
    if (typeof icon === 'undefined') {
      return renderStandardIcon('alert');
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
