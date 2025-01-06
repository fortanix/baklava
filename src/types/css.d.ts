/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type * as CSS from 'csstype';

// https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
declare module 'csstype' {
  interface Properties {
    // Add a few bleeding edge CSS properties
    positionAnchor?: string,
    anchorName?: string,
    
    // Allow any CSS Custom Properties
    [index: `--${string}`]: string | number,
  }
}
