/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


/**
 * 
 * @param maxDuration 
 * @returns 
 */
export const useTypeAhead = (maxDuration = 400/*ms*/) => {
  const [sequence, setSequence] = React.useState<Array<string>>([]);
  const lastKeyPressTime = React.useRef(Date.now());
  
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    setSequence((prevSequence) => {
      const isPrintable = event.key.length === 1; // For control characters, `key` will be a longer word (e.g. `Tab`)
      
      // Note: we want to:
      // - Allow 'Shift' (we don't want to block things like capitals or other shift keyboard layout characters)
      // - Allow Alt/AltGraph (commonly used for composition, e.g. Alt+Shift+2 could become "€").
      const hasModifier = (['Control', 'Meta'] as const).some(mod => event.getModifierState(mod));
      
      if (!isPrintable || hasModifier) { return prevSequence; }
      
      event.preventDefault();
      event.stopPropagation();
      
      const now = Date.now();
      const shouldReset = now - lastKeyPressTime.current > maxDuration;
      lastKeyPressTime.current = now;
      
      if (shouldReset) {
        return [event.key];
      }
      return [...prevSequence, event.key];
    });
  }, [maxDuration]);
  
  return { handleKeyDown, sequence };
};
