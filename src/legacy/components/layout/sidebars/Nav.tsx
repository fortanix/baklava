/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $msg from 'message-tag';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';
import { Link } from 'react-router-dom';

import { handleNavKeyDown } from '../../../util/keyboardHandlers.tsx';

import { Button } from '../../buttons/Button.tsx';
import { SidebarContext } from './Sidebar.tsx';
import { SidebarTooltip } from './SidebarTooltip.tsx';

import './Nav.scss';


type NavItemProps = ComponentProps<'a'> & {
  tooltip: string,
  to: string,
  active: boolean,
  navIndex?: undefined | number,
  navItemsRef?: undefined | Array<HTMLAnchorElement>,
  label?: undefined | string,
  onClick?: undefined | (() => void),
  disabled?: undefined | boolean,
  tabIndex?: undefined | number,
};
export const NavItem = (props: NavItemProps) => {
  const {
    tooltip,
    to,
    active,
    navIndex,
    navItemsRef,
    label,
    onClick,
    disabled = false,
    tabIndex,
    className,
    ...propsRest
  } = props;
  const { isSidebarCollapsed, setIsSidebarCollapsed } = React.useContext(SidebarContext);
  
  return (
    <Link
      role="menuitem"
      to={disabled ? undefined : to}
      ref={el => { navItemsRef.current[navIndex] = el; }}
      tabIndex={(disabled && -1) || (tabIndex ?? (active ? 0 : -1))}
      {...(active && { 'aria-current': 'page' })}
      aria-disabled={disabled}
      {...propsRest}
      className={cx(
        'bkl bkl-nav__list-item__link',
        className,
        {
          active,
          disabled,
        },
      )}
      onKeyDown={(evt: React.KeyboardEvent<HTMLAnchorElement>) => {
        handleNavKeyDown({
          evt,
          index: navIndex,
          navItems: navItemsRef?.current,
          toggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
        });
      }}
    >
      {propsRest.children ?? label}
    </Link>
  );
};

type NavProps = ComponentProps<'nav'>;
export const Nav = ({ children, className, ...props }: NavProps) => {
  const navItemsRef = React.useRef<Array<HTMLAnchorElement>>([]);
  
  React.Children.forEach(children, (child: React.ReactNode) => {
    if (!React.isValidElement(child)) return;
    
    if (child.type !== NavItem) {
      throw new TypeError(
        $msg`Expected only children of type NavItem, received ${child}`,
      );
    }
  });
  
  return (
    <nav {...props} role="navigation" className={cx('bkl-nav', className)}>
      <ul className="bkl-nav__list" role="menubar">
        {React.Children.map(children, (navItem, index) => {
          if (!navItem || !React.isValidElement(navItem)) return null;
          const { tooltip, disabled } = navItem.props;
          return (
            <li className="bkl-nav__list-item" role="presentation">
              <SidebarTooltip content={tooltip}>
                <Button
                  plain
                  className="bkl-nav__tooltip-btn"
                  tabIndex={-1}
                  disabled={disabled}
                >
                  {React.cloneElement(navItem, {
                    navIndex: index,
                    navItemsRef,
                  })}
                </Button>
              </SidebarTooltip>
            </li>
          )
        })}
      </ul>
    </nav>
  );
};
