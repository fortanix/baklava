
import * as React from 'react';

import cl from './Scroller.module.scss';


export const useScroller = () => {
  const props = React.useMemo(() => ({
    tabIndex: 0,
    className: cl['bk-util-scroller'],
  }), []);
  
  return props;
};
