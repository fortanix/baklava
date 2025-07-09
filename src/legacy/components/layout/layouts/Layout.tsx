
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';
import * as React from 'react';

import './Layout.scss';


export type LayoutContextT = {
  sidebarCollapsed: boolean,
};

export const initLayoutState = (state = {}) => ({
  sidebarCollapsed: false,
  ...state,
});

export const LayoutContext = React.createContext<LayoutContextT>(initLayoutState());

export type LayoutProps = ComponentPropsWithoutRef<'main'> & {
  children: React.ReactNode,
  state: LayoutContextT,
  updateState: (stateUpdated: LayoutContextT) => void,
};
export const Layout = Object.assign(
  (props: LayoutProps) => {
    const { className, children, state = initLayoutState(), updateState, ...propsRest } = props;
    
    const layoutState = React.useMemo(() => ({
      ...state,
      update: (stateUpdated: Partial<LayoutContextT>) => { updateState?.({ ...state, ...stateUpdated }); },
    }), [state, updateState]);
    
    return (
      <LayoutContext.Provider value={layoutState}>
        <main {...propsRest} className={cx('bkl-layout', className)}>
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

export default Layout;
