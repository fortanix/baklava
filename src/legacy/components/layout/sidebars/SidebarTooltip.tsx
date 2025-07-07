
import * as React from 'react';
import cx from 'classnames';
import { Tooltip } from '../../overlays/tooltip/Tooltip';
import { SidebarContext } from './Sidebar';


type SidebarTooltipProps = React.ComponentPropsWithoutRef<typeof Tooltip> & {
  content: React.ComponentPropsWithoutRef<typeof Tooltip>['content'],
  show?: boolean,
  className?: string,
};
export const SidebarTooltip = (props: SidebarTooltipProps) => {
  const { className, show = false, content, ...propsRest } = props;
  
  const { isSidebarCollapsed } = React.useContext(SidebarContext);
  const [tooltipContent, setTooltipContent] = React.useState<SidebarTooltipProps['content']>('');

  const tooltipProps = {
    placement: 'right',
    className: cx('bkl-sidebar-tooltip', className),
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
