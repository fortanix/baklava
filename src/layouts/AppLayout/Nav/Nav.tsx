/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Link } from '../../../components/actions/Link/Link.tsx';
import { Icon, type IconName } from '../../../components/graphics/Icon/Icon.tsx';

import cl from './Nav.module.scss';


export type NavItemProps = ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A custom `Link` component. Optional. */
  Link?: undefined | React.ComponentType<
    Pick<React.ComponentProps<'a'>, 'tabIndex' | 'aria-disabled' | 'href' | 'className' | 'onClick'>
  >,
  
  href?: undefined | string,
  icon?: undefined | IconName,
  label?: undefined | string,
  
  /** Whether this nav item is the currently active one. Default: false. */
  active?: undefined | boolean,
  
  /** Whether this nav item should be disabled. Default: false. */
  disabled?: undefined | boolean,
};
export const NavItem = (props: NavItemProps) => {
  const {
    children,
    unstyled,
    Link: LinkP,
    className,
    href,
    label,
    icon,
    active = false,
    disabled = false,
    ...propsRest
  } = props;
  
  const DefaultLink = React.useCallback((props: React.ComponentProps<typeof Link>) => <Link unstyled {...props}/>, []);
  const LinkC = LinkP ?? DefaultLink;
  
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
    }
  }, [disabled]);
  
  const renderItem = () => {
    if (label) {
      return (
        <LinkC
          tabIndex={disabled ? -1 : undefined}
          aria-disabled={disabled}
          href={href}
          className={cx(cl['bk-nav__item__link'], { [cl['bk-nav__item__link--disabled']]: disabled })}
          onClick={handleClick}
        >
          {icon && <Icon className={cx(cl['bk-nav__item__link__icon'])} icon={icon}/>}
          <span className={cx(cl['bk-nav__item__link__label'])}>{label}</span>
        </LinkC>
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
        className
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
