/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { flushSync } from 'react-dom';


// Ref: https://malcolmkee.com/blog/view-transition-api-in-react-app
export const startViewTransition = (transition: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      flushSync(transition);
    });
  } else {
    transition();
  }
};
