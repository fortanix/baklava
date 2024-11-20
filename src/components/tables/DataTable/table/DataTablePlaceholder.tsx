
import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../../util/componentUtil.ts';
import { type IconKey, isIconKey } from '../../../../assets/icons/_icons.ts';
import { Icon, type IconProps } from '../../../graphics/Icon/Icon.tsx';

//import './DataTablePlaceholder.scss';


type DataTablePlaceholderProps = ComponentProps<'div'> & {
  icon?: IconKey | React.ReactNode,
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
    if (typeof icon === 'undefined') {
      return renderStandardIcon('view-type-table');
    }
    if (typeof icon === 'string') {
      if (isIconKey(icon)) {
        return renderStandardIcon(icon);
      }
      throw new Error(`Invalid icon ${icon}`);
    }
    return icon;
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
DataTablePlaceholder.displayName = 'DataTablePlaceholder';


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
DataTablePlaceholderSkeleton.displayName = 'DataTablePlaceholderSkeleton';


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
DataTablePlaceholderEmpty.displayName = 'DataTablePlaceholderEmpty';


type DataTableErrorIconProps = Omit<IconProps, 'icon'> & {
  icon?: IconProps['icon'],
};
export const DataTableErrorIcon = (props: DataTableErrorIconProps) => {
  const decoration = React.useMemo(() => ({ type: 'background-circle' } as const), []);
  return (
    <div className="bk-table-placeholder--error__error-icon">
      <Icon icon="cross" className="icon-cross"/>
      <Icon decoration={decoration} icon="view-type-table"
        {...props}
        className={cx('bk-table-placeholder__icon', props.className)}
      />
    </div>
  );
};
DataTableErrorIcon.displayName = 'DataTableErrorIcon';

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
DataTablePlaceholderError.displayName = 'DataTablePlaceholderError';


type DataTableRowPlaceholderProps = ComponentProps<'div'> & {
  icon?: IconKey | React.ReactNode,
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
      return renderStandardIcon('event-warning');
    }
    if (typeof icon === 'string') {
      if (isIconKey(icon)) {
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
      className={cx('bk-table-row-placeholder--end-of-table', props.className)}
    />
  );
};
DataTablePlaceholderEndOfTable.displayName = 'DataTablePlaceholderEndOfTable';
