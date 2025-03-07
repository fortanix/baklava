/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { InputSensitive } from './InputSensitive.tsx';


/**
 * A password input control.
 */
export const InputPassword = (props: React.ComponentProps<typeof InputSensitive>) => {
  return (
    <InputSensitive
      placeholder="Password"
      type="password"
      {...props}
    />
  );
};
