/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */


declare module "*.module.css" {
  //const classes: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: Type checking will be done in IDE with `typescript-plugin-css-modules`
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}
declare module "*.module.scss" {
  //const classes: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: Type checking will be done in IDE with `typescript-plugin-css-modules`
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}

// Extend `HTMLElement` with `togglePopover` variant that accepts an object. Remove this once TypeScript adds support:
// https://github.com/microsoft/TypeScript/blob/d0d675a363bf25d435857766757d97b9ad508909/src/lib/dom.generated.d.ts#L14240
type TogglePopoverOptions = {
  force?: undefined | boolean,
  // NOTE: `source` must be an `HTMLElement`, not just any `Element`. If given, for example, an `<svg>` element, the
  // browser will throw an exception.
  source?: undefined | HTMLElement,
};
interface HTMLElement {
  togglePopover(options?: undefined | TogglePopoverOptions ): boolean,
}
