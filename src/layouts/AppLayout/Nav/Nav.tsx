/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Link } from '../../../components/actions/Link/Link.tsx';
import { Icon, type IconName } from '../../../components/graphics/Icon/Icon.tsx';

import cl from './Nav.module.scss';


export type NavItemProps = React.PropsWithChildren<ComponentProps<'li'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  href?: undefined | string,
  icon?: undefined | IconName,
  label?: undefined | string,
  
  active?: undefined | boolean,
}>;
export const NavItem = (props: NavItemProps) => {
  const { unstyled, children, className, href, label, icon, active, ...propsRest } = props;
  const renderItem = () => {
    if (label) {
      return (
        <Link unstyled href={href} className={cx(cl['bk-nav__item__link'])}>
          {icon && <Icon className={cx(cl['bk-nav__item__link__icon'])} icon={icon}/>}
          <span className={cx(cl['bk-nav__item__link__label'])}>{label}</span>
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
