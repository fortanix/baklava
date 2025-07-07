
import * as React from 'react';


export const usePrevious = <T>(value: T) => {
  const ref: React.MutableRefObject<null | T> = React.useRef(null);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useEffectAsync = (effect: () => Promise<unknown>, inputs?: undefined | React.DependencyList): void => {
  React.useEffect(() => {
    effect();
  }, inputs);
};
