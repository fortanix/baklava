/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


type UseFocusProps<T> = {
  autoFocus?: boolean,
  onFocus?: (evt: React.FocusEvent<T>) => void,
  onBlur?: (evt: React.FocusEvent<T>) => void,
};

export const useFocus = <T extends HTMLElement>({ autoFocus = false, onFocus, onBlur }: UseFocusProps<T>) => {
  const ref = React.useRef<T>(null);

  const [isFocused, setIsFocused] = React.useState(autoFocus);
  
  React.useEffect(() => {
    if (ref && ref.current) {
      if (isFocused) {
        ref.current.focus();
      } else {
        ref.current.blur();
      }
    }
  }, [isFocused]);
  
  const handleFocus = (event: React.FocusEvent<T>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(event);
    }
  };
  
  const handleBlur = (event: React.FocusEvent<T>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  return {
    ref,
    isFocused,
    handleFocus,
    handleBlur,
  };
};
