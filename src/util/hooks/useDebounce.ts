/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


type TimeoutRef = ReturnType<typeof globalThis.setTimeout>;
type UseDebounceResult<S> = [S, React.Dispatch<React.SetStateAction<S>>];

// Adopted from: https://github.com/uidotdev/usehooks
export const useDebounce = <S>(value: S, delay: number /* ms */): UseDebounceResult<S> => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const timeoutHandleRef = React.useRef<TimeoutRef>(null);
  
  // Whenever `value` changes, schedule an update after `delay` ms
  React.useEffect(() => {
    if (delay === 0) {
      setDebouncedValue(value);
      
      const timeoutHandle = timeoutHandleRef.current;
      if (timeoutHandle) {
        globalThis.clearTimeout(timeoutHandle);
      }
      
      return;
    }
    
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
  
  // Expose a way to force the debounced value manually
  const setDebouncedManually = React.useCallback((value: React.SetStateAction<S>) => {
    setDebouncedValue(value);
    
    const timeoutHandle = timeoutHandleRef.current;
    if (timeoutHandle) {
      globalThis.clearTimeout(timeoutHandle);
    }
  }, []);
  
  return [debouncedValue, setDebouncedManually];
};
