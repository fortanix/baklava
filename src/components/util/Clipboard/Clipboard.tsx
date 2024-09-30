/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

export const useClipboard = () => {
  return {
    async writeText(text: string) {
      return navigator.clipboard.writeText(text);
    },
  };
};
