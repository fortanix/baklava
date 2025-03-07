/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


/**
 * Hook that handles clicks outside of the passed ref.
 */
export const useOutsideClickHandler = (
  ref: React.RefObject<HTMLElement> | Array<React.RefObject<HTMLElement>>,
  onOutsideClick: (event?: MouseEvent) => void,
) => {
  const hasClickedOutside = React.useCallback((ref: React.RefObject<HTMLElement>, event: MouseEvent) => {
    const target: null | EventTarget = event.target;
    return ref.current && target instanceof Node && !ref.current.contains(target);
  }, []);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((Array.isArray(ref) && ref.every(r => hasClickedOutside(r, event)))
        || (!Array.isArray(ref) && hasClickedOutside(ref, event))) {
        onOutsideClick();
      }
    };
    
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, hasClickedOutside, onOutsideClick]);
};
