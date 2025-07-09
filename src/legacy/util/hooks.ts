/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
