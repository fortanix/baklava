
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './HeaderBar.scss';


type UseScrollBreakpointParams = { breakpoint: number, margin: number };
const useScrollBreakpoint = ({ breakpoint, margin }: UseScrollBreakpointParams) => {
  // Note: no need to memo this function, it's only called on init anyway
  const checkScrollBreakpoint = () => {
    return window.scrollY >= breakpoint;
  };
  
  const [hasScrolled, setHasScrolled] = React.useState(checkScrollBreakpoint);
  
  // Use `margin` (e.g. to prevent shakiness during intermediate range of resizing elements)
  const checkScrollBreakpointWithMargin = React.useCallback(() => {
    if (!hasScrolled) {
      return window.scrollY >= breakpoint;
    } else {
      return window.scrollY >= (breakpoint - margin);
    }
  }, [hasScrolled, breakpoint, margin]);
  
  const handleScroll = React.useCallback(() => {
    const hasScrolledUpdated = checkScrollBreakpointWithMargin();
    if (hasScrolledUpdated !== hasScrolled) {
      setHasScrolled(hasScrolledUpdated);
    }
  }, [hasScrolled, checkScrollBreakpointWithMargin]);
  
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  return hasScrolled;
};

export type HeaderBarProps = ComponentPropsWithoutRef<'header'> & {
  minimizeOnScroll?: boolean,
};
export const HeaderBar = ({ children, minimizeOnScroll, className, ...props }: HeaderBarProps) => {
  const hasScrolledDown = useScrollBreakpoint({ breakpoint: 80, margin: 20 });
  
  return (
    <header {...props}
      className={cx(
        'bkl-header bkl-header-bar',
        { 'bkl-header-bar--minimize': minimizeOnScroll && hasScrolledDown },
        className,
      )}
    >
      {children}
    </header>
  );
};
HeaderBar.defaultProps = {
  minimizeOnScroll: false,
};

export default HeaderBar;
