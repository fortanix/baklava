/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { useDebounce } from './useDebounce.ts';


// Use an active state, but with a delay in unmounting to give exit transitions time to complete
export const useDelayedUnmount = (
  active: boolean,
  setActive: React.Dispatch<React.SetStateAction<boolean>>,
  unmountDelay = 3000, /*ms*/
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [shouldMount, setShouldMount] = useDebounce(active, unmountDelay);
  
  const setActiveWithUnmountDelay = React.useCallback((active: React.SetStateAction<boolean>) => {
    setActive(active);
    if (active) { setShouldMount(true); } // Skip the delay when activating (should only be for deactivation)
  }, [setActive, setShouldMount]);
  
  React.useDebugValue(`Active: ${active} / Mounted: ${shouldMount}`);
  
  return [shouldMount, setActiveWithUnmountDelay];
};
