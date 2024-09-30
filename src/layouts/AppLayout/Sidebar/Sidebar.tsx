/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Sidebar.module.scss';


export type SidebarProps = React.PropsWithChildren<ComponentProps<'aside'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;

/**
 * Sidebar component (for app layout).
 */
export const Sidebar = ({ children, unstyled, ...propsRest }: SidebarProps) => {
  return (
    <aside
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-app-layout-sidebar']]: !unstyled },
        //{ [cl['bk-app-layout-sidebar--collapsible']]: true },
        propsRest.className,
      )}
    >
      {children}
    </aside>
  );
};
