/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Banner.module.scss';
import { Icon, type IconName } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';


export { cl as BannerClassNames };

type BannerIconProps = React.PropsWithChildren<ComponentProps<'div'> & {
  variant: 'informational' | 'warning' | 'alert' | 'success',
}>;
const BannerIcon = (props: BannerIconProps) => {
  const { variant } = props;
  const icon = ((): IconName => {
    switch (variant) {
      case 'informational': return 'info';
      case 'warning': return 'warning';
      case 'alert': return 'status-failed';
      case 'success': return 'status-success';
    }
  })();
  return (<Icon icon={icon} />);
};

export type BannerProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /**
   * Whether the component should include the default styling. Defaults to false.
   */
  unstyled?: undefined | boolean,

  /**
   * Which variant to display, which changes the color and left icon. Defaults to "informational".
   */
  variant?: undefined | 'informational' | 'success' | 'warning' | 'alert',

  /**
   * The message to displayed on the banner. Mandatory.
   */
  title: string,

  /**
   * A sub message to be displayed next to the title. Optional.
   */
  subtitle?: undefined | string,
  
  /**
   * Whether the banner can be closed. Optional. Defaults to false.
   */
  closeButton?: boolean,
  
  /**
   * Any additional actions to be shown in the banner, such as a button.
   */
  actions?: undefined | React.ReactNode,
}>;

/**
 * A banner component, similar to a toast.
 */
export const Banner = (props: BannerProps) => {
  const {
    unstyled = false,
    variant = 'informational',
    title = '',
    subtitle = '',
    closeButton = false,
    actions = null,
    ...propsRest
  } = props;

  const [isClosed, setIsClosed] = React.useState(false);

  if (isClosed) {
    return null;
  }

  return (
    <div
      role="presentation"
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-banner']]: !unstyled,
        [cl[`bk-banner--${variant}`]]: variant,
      }, propsRest.className)}
    >
      <span className={cl['bk-banner__icon']}>
        <BannerIcon variant={variant} />
      </span>
      <strong className={cl['bk-banner__title']}>{title}</strong>
      {subtitle && (
        <span className={cl['bk-banner__subtitle']}>{subtitle}</span>
      )}
      
      {actions}
      {closeButton && (
        <Button
          className={cl['bk-banner__close-button']}
          onClick={() => setIsClosed(true)}
        >
          <Icon icon="cross" />
        </Button>
      )}
    </div>
  );
};

export type BannerActionProps = React.PropsWithChildren<ComponentProps<'div'>>;

/**
 * A wrapper component, intended to easily add some styling to children's `<Button/>`'s. UX expects that such buttons are `<Button variant="tertiary"/>`.
 */
export const BannerAction = (props: BannerActionProps) => {
  return (
    <div className={cl['bk-banner__action']}>
      {props.children}
    </div>
  );
};
