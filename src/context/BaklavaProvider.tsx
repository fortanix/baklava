/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { ModalDialogProvider } from '../components/util/overlays/modal/ModalDialogProvider.tsx';


export const BaklavaProvider = (props: React.PropsWithChildren) => {
  return (
    <ModalDialogProvider>
      {props.children}
    </ModalDialogProvider>
  );
};
