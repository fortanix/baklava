/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../reactUtil.ts';

import * as FG from '@microsoft/focusgroup-polyfill/shadowless';


type UseFocusGroupProps = {
  focusGroup: string,
};
type UseFocusGroupResult<E extends HTMLElement> = {
  ref: React.RefObject<null | E>,
  focusgroup: string,
};
export const useFocusGroup = <E extends HTMLElement>({ focusGroup }: UseFocusGroupProps): UseFocusGroupResult<E> => {
  const ref = React.useRef<E>(null);
  
  useEffectOnce(() => {
    if (ref.current) {
      FG.polyfill(ref.current);
    }
  });
  
  return {
    ref,
    focusgroup: focusGroup,
  };
};
