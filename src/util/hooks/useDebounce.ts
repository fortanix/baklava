
import * as React from 'react';


type TimeoutRef = ReturnType<typeof globalThis.setTimeout>;
type UseDebounceResult<S> = [S, React.Dispatch<React.SetStateAction<S>>];

// Adopted from: https://github.com/uidotdev/usehooks
export const useDebounce = <S>(value: S, delay: number /* ms */): UseDebounceResult<S> => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const timeoutHandleRef = React.useRef<TimeoutRef>(null);
  
  React.useEffect(() => {
    timeoutHandleRef.current = globalThis.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      const timeoutHandle = timeoutHandleRef.current;
      if (timeoutHandle) {
        globalThis.clearTimeout(timeoutHandle);
      }
    };
  }, [value, delay]);
  
  const setDebouncedManually = React.useCallback((value: React.SetStateAction<S>) => {
    setDebouncedValue(value);
    
    const timeoutHandle = timeoutHandleRef.current;
    if (timeoutHandle) {
      globalThis.clearTimeout(timeoutHandle);
    }
  }, []);
  
  return [debouncedValue, setDebouncedManually];
};
