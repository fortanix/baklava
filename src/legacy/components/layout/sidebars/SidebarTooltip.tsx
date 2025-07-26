/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../util/component_util.tsx';
import { Tooltip } from '../../overlays/tooltip/Tooltip.tsx';
import { SidebarContext } from './Sidebar.tsx';


type SidebarTooltipProps = React.ComponentProps<typeof Tooltip> & {
  content: React.ComponentProps<typeof Tooltip>['content'],
  show?: undefined | boolean,
  className?: undefined | ClassNameArgument,
};
export const SidebarTooltip = (props: SidebarTooltipProps) => {
  const { className, show = false, content, ...propsRest } = props;
  
  const { isSidebarCollapsed } = React.useContext(SidebarContext);
  const [tooltipContent, setTooltipContent] = React.useState<SidebarTooltipProps['content']>('');

  const tooltipProps = {
    placement: 'right' as const,
    className: cx('bkl bkl-sidebar-tooltip', className),
  };
  
  React.useEffect(() => {
    let timeOut: ReturnType<typeof setTimeout>;
    const isShow = isSidebarCollapsed || show;
    
    // Show tooltip with delay in correct position on keyboard nav toggle
    if (isShow) {
      timeOut = setTimeout(() => {
        return setTooltipContent(content);
      }, 500);
    } else {
      setTooltipContent('');
    }
    
    return () => {
      if (timeOut) {
        clearTimeout(timeOut)
      }
    };
  }, [isSidebarCollapsed, show, content]);

  // Hide tooltip if primary sidebar is expanded
  return (
    <Tooltip
      key="enabled"
      {...tooltipProps}
      {...propsRest}
      content={tooltipContent}
    />
  );
};
