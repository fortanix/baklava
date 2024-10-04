/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

declare module "*.module.css" {
  //const classes: Record<string, string>;
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}
declare module "*.module.scss" {
  //const classes: Record<string, string>;
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}
