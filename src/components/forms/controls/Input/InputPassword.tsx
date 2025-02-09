/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Input } from './Input.tsx';


/** A password input control. */
export const InputPassword = (props: React.ComponentProps<typeof Input>) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <Input
      type={isVisible ? 'text' : 'password'}
      placeholder="Password"
      actions={
        <Input.Action
          icon={isVisible ? 'eye-open' : 'eye-closed'}
          label={isVisible ? 'Password is visible' : 'Password is hidden'}
          onPress={() => { setIsVisible(visible => !visible); }}
        />
      }
      {...props}
    />
  );
};
