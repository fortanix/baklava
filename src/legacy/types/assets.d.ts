/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Placeholder types for webpack asset imports
// https://webpack.js.org/guides/typescript

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.svg?sprite' {
  const content: any;
  export default content;
}
