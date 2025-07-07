
import * as React from 'react';

type Ref<T> = null | React.RefCallback<T> | React.MutableRefObject<T>;

export const useCombinedRefs = <R>(...refs: Array<Ref<null | R>>): React.RefObject<R> => {
  const refCombined = React.useRef<R>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(refCombined.current);
      } else {
        ref.current = refCombined.current;
      }
    });
  }, [refs]);

  return refCombined;
};
