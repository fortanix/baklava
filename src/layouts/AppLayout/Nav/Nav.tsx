/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks } from '../../../util/reactUtil.ts';

import { Link as LinkDefault } from '../../../components/actions/Link/Link.tsx';
import { type IconName, Icon as IconDefault } from '../../../components/graphics/Icon/Icon.tsx';

import cl from './Nav.module.scss';


type NavItemLinkProps = Pick<
  React.ComponentProps<typeof LinkDefault>,
  'children' | 'unstyled' | 'tabIndex' | 'aria-disabled' | 'href' | 'className' | 'onClick'
>;
type NavItemIconProps = Pick<React.ComponentProps<typeof IconDefault>, 'className'> & {
  icon?: undefined | string,
};

export type NavItemProps<
  LinkProps extends NavItemLinkProps,
  IconProps extends NavItemIconProps,
> = ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A custom `Link` component. Optional. */
  Link?: undefined | React.ComponentType<LinkProps>,
  
  /** Additional props to pass to the `Link` component. */
  linkProps?: undefined | LinkProps,
  
  /** The target of the nav item link. */
  href?: undefined | string,
  
  /** An icon to show before the link label. */
  icon?: undefined | IconName,
  
  /** A custom `Icon` component. Optional. */
  Icon?: undefined | React.ComponentType<IconProps>,
  
  /** Additional props to pass to the `Icon` component. */
  iconProps?: undefined | IconProps,
  
  /** The nav item link label. */
  label?: undefined | string,
  
  /** Any additional indicators to be shown after the label. */
  indicators?: undefined | React.ReactNode,
  
  /** Whether this nav item is the currently active one. Default: false. */
  active?: undefined | boolean,
  
  /** Whether this nav item should be disabled. Default: false. */
  disabled?: undefined | boolean,
};
export const NavItem = <
  LinkProps extends NavItemLinkProps,
  IconProps extends NavItemIconProps,
>(props: NavItemProps<LinkProps, IconProps>) => {
  const {
    children,
    unstyled,
    className,
    Link = LinkDefault,
    linkProps = {} as LinkProps,
    href,
    icon,
    Icon = IconDefault,
    iconProps = {} as IconProps,
    label,
    indicators,
    active = false,
    disabled = false,
    ...propsRest
  } = props;
  
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
    }
  }, [disabled]);
  
  const renderItem = () => {
    if (label) {
      return (
        <Link
          unstyled
          tabIndex={disabled ? -1 : undefined}
          aria-disabled={disabled ? true : undefined}
          href={href}
          {...linkProps}
          className={cx(
            cl['bk-nav__item__link'],
            { [cl['bk-nav__item__link--disabled']]: disabled },
            linkProps.className,
          )}
          onClick={mergeCallbacks([linkProps.onClick, handleClick])}
        >
          {(icon && Icon === IconDefault) &&
            <Icon icon={icon} {...iconProps} className={cx(cl['bk-nav__item__link__icon'], iconProps.className)}/>
          }
          {Icon !== IconDefault &&
            // @ts-ignore
            <Icon {...iconProps} className={cx(cl['bk-nav__item__link__icon'], iconProps.className)}/>
          }
          <span className={cx(cl['bk-nav__item__link__label'])}>{label}</span>
          {indicators}
        </Link>
      );
    }
    return children;
  };
  
  return (
    <li
      aria-current={active ? 'page' : undefined}
      {...propsRest}
      className={cx(
        { [cl['bk-nav__item']]: !unstyled },
        className,
      )}
    >
      {renderItem()}
    </li>
  );
};

export type NavProps = React.PropsWithChildren<ComponentProps<'nav'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Nav component.
 */
export const Nav = Object.assign(
  ({ unstyled, children, className, ...propsRest }: NavProps) => {
    return (
      <nav
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-nav']]: !unstyled },
        )}
      >
        <menu>
          {children}
        </menu>
      </nav>
    );
  },
  { NavItem },
);
