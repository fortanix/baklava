/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const delay = (timeMs: number) => {
  return new Promise(resolve => setTimeout(resolve, timeMs));
};

export const timeout = (timeMs: number) => {
  const message = `The action took too long to complete`;
  return new Promise((_, reject) => setTimeout(reject, timeMs, new Error(message)));
};
