/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


type useSidebarCollapseHandlerProps = {
  isSidebarCollapsed: boolean,
  setIsSidebarCollapsed: (sidebarCollapsed: boolean) => void,
};
export const useSidebarCollapseHandler = (): useSidebarCollapseHandlerProps => {
  const [collapsed, setIsCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebar-status');
    setIsCollapsed(sidebarStatus === 'collapsed');
  }, []);
  
  const setIsSidebarCollapsed = (sidebarCollapsed: boolean) => {
    setIsCollapsed(sidebarCollapsed);
    localStorage.setItem('sidebar-status', sidebarCollapsed ? 'collapsed' : 'open');
  };
  
  return {
    isSidebarCollapsed: collapsed,
    setIsSidebarCollapsed,
  };
};
