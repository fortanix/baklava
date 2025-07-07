/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

// Util
import { useSidebarCollapseHandler } from '../../../util/hooks/useSidebarCollapseHandler.ts';

// Components
import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Button } from '../../buttons/Button.tsx';

import './Sidebar.scss';


type SidebarContextT = {
  isSidebarCollapsed: boolean,
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void,
};
export const SidebarContext = React.createContext<SidebarContextT>({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
});

type CollapseButtonProps = ComponentProps<'button'> & {
  collapsed: boolean,
  toggleCollapsed: () => void,
};
export const CollapseButton : React.FC<CollapseButtonProps> = ({ className, collapsed, toggleCollapsed }) => {
  return (
    <Button
      aria-label="Collapse button"
      onClick={toggleCollapsed}
      className={cx('bkl-sidebar--collapsed-button', className)}
    >
      <BaklavaIcon
        icon={collapsed ? 'sidebar-closed' : 'sidebar-open'}
        aria-hidden="true"
      />
    </Button>
  );
};

type SidebarProps = ComponentProps<'aside'> & {
  collapsable?: undefined | boolean,
};
export const Sidebar = ({ children, className, collapsable = false, ...props }: SidebarProps) => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarCollapseHandler();

  const context = { isSidebarCollapsed, setIsSidebarCollapsed };

  return (
    <SidebarContext.Provider value={context}>
      <aside
        {...props}
        className={cx('bkl-sidebar', {
          'bkl-sidebar--collapsed': collapsable && isSidebarCollapsed
        }, className)}
      >
        {children}

        {collapsable &&
          <CollapseButton
            collapsed={isSidebarCollapsed}
            toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        }
      </aside>
    </SidebarContext.Provider>
  );
};
