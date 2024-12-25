/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type IconName, type IconProps, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import cl from './Banner.module.scss';


export { cl as BannerClassNames };

type BannerVariant = 'informational' | 'warning' | 'error' | 'success';

type BannerIconProps = Omit<IconProps, 'icon'> & {
  icon?: IconProps['icon'], // Make optional
  variant: BannerVariant,
};
const BannerIcon = (props: BannerIconProps) => {
  const { variant } = props;
  const icon = ((): IconName => {
    switch (variant) {
      case 'informational': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'status-failed';
      case 'success': return 'status-success';
      default: return assertUnreachable(variant);
    }
  })();
  return <Icon icon={icon} {...props}/>;
};

export type BannerProps = Omit<ComponentProps<'div'>, 'title'> & {
  /**
   * Whether the component should include the default styling. Defaults to false.
   */
  unstyled?: undefined | boolean,
  
  /**
   * Which variant to display, which changes the color and left icon. Defaults to "informational".
   */
  variant?: undefined | BannerVariant,
  
  /**
   * The title of the banner. Required.
   */
  title: React.ReactNode,
  
  /** The message to display. Optional. */
  message?: undefined | React.ReactNode,
  
  /** Whether the banner can be closed. Optional. Defaults to false. */
  closeButton?: undefined | boolean,
  
  /** Action to perform on close */
  onClose?: undefined | (() => void),
  
  /** Any additional actions to be shown in the banner, e.g. an action button. */
  actions?: undefined | React.ReactNode,
};

/**
 * An inline banner that displays a message to the user.
 */
export const Banner = (props: BannerProps) => {
  const {
    unstyled = false,
    variant = 'informational',
    title = '',
    message,
    closeButton = false,
    onClose,
    actions = null,
    ...propsRest
  } = props;
  
  return (
    <div
      role="alert" // Note: if the banner is not time-sensitive, this may need to be overridden (depends on use case)
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-banner']]: !unstyled },
        { [cl[`bk-banner--${variant}`]]: variant },
        propsRest.className,
      )}
    >
      <div className={cl['bk-banner__content']}>
        <strong className={cl['bk-banner__title']}>
          <BannerIcon variant={variant} className={cl['bk-banner__title__icon']}/>
          <span className={cl['bk-banner__title__text']}>{title}</span>
        </strong>
        {message &&
          <span className={cx('bk-body-text', cl['bk-banner__message'])}>{message}</span>
        }
      </div>
      
      {actions}
      
      {closeButton &&
        <Button className={cl['bk-banner__close-button']} onPress={onClose} aria-label="Close banner">
          <Icon icon="cross"/>
        </Button>
      }
    </div>
  );
};

export type BannerActionProps = ComponentProps<'div'>;
/**
 * A wrapper component, intended to easily add some styling to children's `<Button/>`'s. UX expects that such buttons
 * are `<Button variant="tertiary"/>`.
 */
export const BannerAction = (props: BannerActionProps) => {
  return (
    <div className={cl['bk-banner__action']}>
      {props.children}
    </div>
  );
};
