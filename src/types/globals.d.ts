/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */


declare module '*.module.css' {
  //const classes: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: Type checking will be done in IDE with `typescript-plugin-css-modules`
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}
declare module '*.module.scss' {
  //const classes: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: Type checking will be done in IDE with `typescript-plugin-css-modules`
  const classes: any; // Must be `any` rather than `Record<>`, because with record index returns `string | undefined`
  export default classes;
}

interface CloseWatcher extends EventTarget {
  requestClose(): void;
  destroy(): void;
  close(): void;
  onclose: ((this: CloseWatcher, e: CustomEvent) => void) | null;
  oncancel: ((this: CloseWatcher, e: CustomEvent) => void) | null;
}

interface CloseWatcherOptions {
  signal?: AbortSignal;
}

declare var CloseWatcher: {
  prototype: CloseWatcher;
  new (options?: undefined | CloseWatcherOptions): CloseWatcher;
};

interface Window {
  CloseWatcher: typeof CloseWatcher;
}
