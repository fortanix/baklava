/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { ModalDialogProvider } from '../components/util/overlays/modal/ModalDialogProvider.tsx';
import { ToastProvider, notify } from '../components/overlays/ToastProvider/ToastProvider.tsx';


// Debug utility for toast notifications
let addedTestNotify = false;
if (!addedTestNotify && process.env.NODE_ENV === 'development') {
  let count = 1;
  window.addEventListener('keydown', event => {
    if (event.key === 't') {
      notify({
        // biome-ignore lint/style/noNonNullAssertion: Will not be undefined.
        variant: (['success', 'info', 'error', 'warning'] as const)[count % 4]!,
        title: `Test ${count++}`,
        message: 'Test notification',
      });
    }
  });
  addedTestNotify = true;
}

export const BaklavaProvider = (props: React.PropsWithChildren) => {
  return (
    <ModalDialogProvider>
      <ToastProvider global>
        {props.children}
      </ToastProvider>
    </ModalDialogProvider>
  );
};
