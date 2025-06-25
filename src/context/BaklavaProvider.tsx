/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { TopLayerManager } from '../components/util/overlays/TopLayerManager.tsx';
import { ToastProvider } from '../components/overlays/ToastProvider/ToastProvider.tsx';


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

export const BaklavaProvider = (props: React.PropsWithChildren) => {
  return (
    <TopLayerManager>
      <ToastProvider global>
        {props.children}
      </ToastProvider>
    </TopLayerManager>
  );
};
