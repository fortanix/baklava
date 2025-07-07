/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Wait for the given delay (in ms)
export const delay = async (delayMs: number) => {
  if (typeof window === 'object') {
    return new Promise(resolve => { window.setTimeout(resolve, delayMs); });
  } else if (typeof global === 'object') {
    return new Promise(resolve => { global.setTimeout(resolve, delayMs); });
  } else {
    throw new Error(`Unknown environment`);
  }
};
