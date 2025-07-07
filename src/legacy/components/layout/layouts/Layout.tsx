/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import './Layout.scss';


export type LayoutContextT = {
  sidebarCollapsed: boolean,
};
export type LayoutContextApi = LayoutContextT & {
  update: (stateUpdated: Partial<LayoutContextT>) => void,
};

export const initLayoutState = (state = {}) => ({
  sidebarCollapsed: false,
  update: () => {},
  ...state,
});

export const LayoutContext = React.createContext<LayoutContextApi>(initLayoutState());

export type LayoutProps = ComponentProps<'main'> & {
  state: LayoutContextT,
  updateState: (stateUpdated: LayoutContextT) => void,
};
export const Layout = Object.assign(
  (props: LayoutProps) => {
    const { className, children, state = initLayoutState(), updateState, ...propsRest } = props;
    
    const layoutState = React.useMemo<LayoutContextApi>(() => ({
      ...state,
      update: (stateUpdated: Partial<LayoutContextT>) => { updateState?.({ ...state, ...stateUpdated }); },
    }), [state, updateState]);
    
    return (
      <LayoutContext.Provider value={layoutState}>
        <main {...propsRest} className={cx('bkl bkl-layout', className)}>
          {children}
        </main>
      </LayoutContext.Provider>
    );
  },
  {
    // Convenience shorthands
    Context: LayoutContext,
    initLayoutState,
  },
);
