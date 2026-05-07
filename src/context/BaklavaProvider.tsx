/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { TopLayerManager } from '../components/util/overlays/TopLayerManager.tsx';
import { ToastProvider } from '../components/overlays/ToastProvider/ToastProvider.tsx';
import { useEffectOnce } from '../util/reactUtil.ts';


/*
// Debug utility for toast notifications
let addedTestNotify = false;
if (!addedTestNotify && import.meta.env.MODE === 'development') {
  let count = 1;
  window.addEventListener('keydown', event => {
    if (event.key === 't') {
      notify({
        // biome-ignore lint/style/noNonNullAssertion: Will not be undefined.
        variant: (['success', 'info', 'error', 'warning'] as const)[count % 4]!,
        title: `Test ${count++}`,
        message: 'Test notification. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      });
    }
  });
  addedTestNotify = true;
}
*/


/**
 * Track the current device pixel ratio and store it as a CSS custom property (for use in styling).
 * Inspired by: https://frontendmasters.com/blog/obsessing-over-smooth-radial-gradient-disc-edges
 */
const useDevicePixelRatioTracker = () => {
  const [devicePixelRatio, setDevicePixelRatio] = React.useState<number>(window.devicePixelRatio);
  
  React.useEffect(() => {
    document.body.style.setProperty('--bk-device-pixel-ratio', String(devicePixelRatio));
    
    const controller = new AbortController();
    window.matchMedia(`(resolution: ${window.devicePixelRatio}x)`)
      .addEventListener('change',
        () => { setDevicePixelRatio(window.devicePixelRatio); },
        { signal: controller.signal },
      );
    
    return () => { controller.abort(); };
  }, [devicePixelRatio]);
};

/**
 * Determine whether the current user agent supports CSS `@scope`. If not, mark it using a class name.
 * Note: this currently has to be done in JS, because we cannot detect it using CSS `@supports`. Once browsers support
 * `@supports at-rule()`, then we could drop this in favor of `@supports at-rule(@scope)`.
 */
const useCssScopeSupportTracker = () => {
  useEffectOnce(() => {
    if (!('CSSScopeRule' in window)) {
      document.documentElement.classList.add('bk-supports-no-scope');
    }
  });
};

export const BaklavaProvider = (props: React.PropsWithChildren) => {
  useDevicePixelRatioTracker();
  useCssScopeSupportTracker();
  
  return (
    <TopLayerManager>
      <ToastProvider global>
        {props.children}
      </ToastProvider>
    </TopLayerManager>
  );
};
