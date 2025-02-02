
/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Icon, type IconName } from '../Icon/Icon.tsx';

import cl from './PlaceholderEmpty.module.scss';

export { cl as PlaceholderEmptyClassNames };

export type PlaceholderEmptySize = 'large' | 'small';

export type PlaceholderEmptyProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A size of this component. Defaults to "large". */
  size?: undefined | PlaceholderEmptySize,

  /** The icon to show in the placeholder. */
  icon?: undefined | IconName,
  
  /** A custom icon of this component. */
  customIcon?: undefined | React.ReactNode,

  /** A title of this component. Mandatory. */
  title: string,
  
  /** A sub message to be displayed next to the title. */
  subtitle?: undefined | string | React.ReactNode,
  
  /** Any additional actions to be shown in this component, such as a button. */
  actions?: undefined | React.ReactNode,
}>;
/**
 * A way to display the absence of data.
 */
export const PlaceholderEmpty = (props: PlaceholderEmptyProps) => {
  const {
    unstyled = false,
    size = 'large',
    icon = 'file', // FIXME: need the icon from the Figma
    customIcon = null,
    title = '',
    subtitle = '',
    actions = null,
    children,
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-placeholder-empty']]: !unstyled,
        [cl['bk-placeholder-empty--large']]: size === 'large',
        [cl['bk-placeholder-empty--small']]: size === 'small',
      }, propsRest.className)}
    >
      {customIcon || <Icon className={cl['bk-placeholder-empty__icon']} icon={icon} />}
      
      <div className={cl['bk-placeholder-empty__content']}>
        {title && (
          <span className={cl['bk-placeholder-empty__content__title']}>{title}</span>
        )}
        {subtitle && (
          <span className={cl['bk-placeholder-empty__content__subtitle']}>{subtitle}</span>
        )}
        {actions}
      </div>
    </div>
  );
};

export type PlaceholderEmptyActionProps = React.PropsWithChildren<ComponentProps<'div'>>;
/**
 * A wrapper component, intended to easily add some styling to children's `<Button/>`'s. 
 * UX expects that such buttons are `<Button kind="tertiary"/>`.
 */
export const PlaceholderEmptyAction = (props: PlaceholderEmptyActionProps) => {
  return (
    <div className={cl['bk-placeholder-empty__content__action']}>
      {props.children}
    </div>
  );
};
