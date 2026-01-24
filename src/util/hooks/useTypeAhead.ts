/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { removeCombiningCharacters } from '../formatting.ts';
import * as React from 'react';


export const normalizeQueryString = (query: string) => {
  // For type-ahead search, we will want to ignore whitespace, such that the user does not need to match the
  // whitespace exactly
  return removeCombiningCharacters(query.trim().toLocaleLowerCase()).replaceAll(/\s+/g, '');
};

/**
 * Track the user's typing to drive a type-ahead search.
 * @param maxDuration The time in miliseconds before we consider a key input as a new sequence.
 */
export const useTypeAhead = (maxDuration = 400/*ms*/) => {
  const [sequence, setSequence] = React.useState<Array<string>>([]);
  const lastKeyPressTime = React.useRef(Date.now());
  
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    const now = Date.now();
    const shouldReset = now - lastKeyPressTime.current > maxDuration;
    lastKeyPressTime.current = now;
    
    setSequence(prevSequence => {
      const currentSequence = shouldReset ? [] : prevSequence;
      
      // Ignore isolated space inputs, since we likely instead want this to trigger an action (e.g. clicking a button
      // or selecting a form input).
      if (event.key === ' ') { return currentSequence; }
      
      if (event.key === 'Backspace') {
        return currentSequence.slice(0, -1);
      }
      
      const isPrintable = event.key.length === 1; // For control characters, `key` will be a longer word (e.g. `Tab`)
      
      // Note: we should ignore the following modifiers:
      // - 'Shift' (we don't want to block things like capitals or other shift keyboard layout characters)
      // - Alt/AltGraph (commonly used for composition, e.g. Alt+Shift+2 could become "€").
      const hasModifier = (['Control', 'Meta'] as const).some(mod => event.getModifierState(mod));
      
      const isInput = event.target instanceof HTMLInputElement;
      
      if (!isPrintable || hasModifier || isInput) { return currentSequence; }
      
      // Note: only do the following for actual search input characters, we don't want to `preventDefault()` for
      // control key inputs like 'Enter' or 'Space' for example.
      event.preventDefault();
      event.stopPropagation();
      
      return [...currentSequence, event.key];
    });
  }, [maxDuration]);
  
  const query = normalizeQueryString(sequence.join(''));
  return { handleKeyDown, sequence, query };
};
