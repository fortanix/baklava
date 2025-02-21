/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Input } from './Input.tsx';


/** A basic search input control. */
export const InputSearch = (props: React.ComponentProps<typeof Input>) =>
  <Input
    icon="search"
    iconLabel="Search"
    placeholder="Search"
    {...props}
  />;
