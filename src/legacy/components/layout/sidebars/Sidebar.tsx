
import cx from 'classnames/dedupe';
import * as React from 'react';

// Util
import { useSidebarCollapseHandler } from '../../../util/hooks/useSidebarCollapseHandler';

// Component
import { SpriteIcon as Icon } from '../../icons/Icon';
import { Button } from '../../buttons/Button';

import './Sidebar.scss';


const SidebarClosedIcon = import('../../../assets/icons/sidebar-closed.svg?sprite');
const SidebarOpenIcon = import('../../../assets/icons/sidebar-open.svg?sprite');

type SidebarContextT = {
  isSidebarCollapsed: boolean,
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void,
};
export const SidebarContext = React.createContext<SidebarContextT>({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
});

export type CollapseButtonProps = Omit<JSX.IntrinsicElements['button'], 'className'> & {
  className?: {},
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
      <Icon
        name={collapsed ? 'sidebar-closed' : 'sidebar-open'}
        icon={collapsed ? SidebarClosedIcon : SidebarOpenIcon}
        aria-hidden="true"
      />
    </Button>
  );
};

export type SidebarProps = Omit<JSX.IntrinsicElements['aside'], 'className'> & {
  children : React.ReactNode,
  className?: {},
  collapsable?: boolean,
};
export const Sidebar : React.FC<SidebarProps>= ({ children, className, collapsable = false, ...props }) => {
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

export default Sidebar;
