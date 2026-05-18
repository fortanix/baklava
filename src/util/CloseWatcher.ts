/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: CustomCloseWatcher is a wrapper for native CloseWatcher API.
// Native CloseWatcher API is not supported in all browsers yet.
// Some methods like 'requestClose' which is supported in native CloseWatcher
// API is not implemented.

type CustomEventHandler = (event: CustomEvent) => void;

export class CustomCloseWatcher {
  private watcher: CloseWatcher | null = null;
  private destroyed = false;
  private handlers: {
    close?: CustomEventHandler | undefined;
    cancel?: CustomEventHandler | undefined;
  } = {};
  private abortController?: AbortController;

  constructor(options: CloseWatcherOptions = {}) {
    if ('CloseWatcher' in window) {
      this.watcher = new CloseWatcher(options);

      this.watcher.oncancel = event => {
        this.handlers.cancel?.(event as CustomEvent);
      };

      this.watcher.onclose = event => {
        this.destroyed = true;
        this.handlers.close?.(event as CustomEvent);
      };

      return;
    }

    // Safari fallback
    this.abortController = new AbortController();

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') {
        return;
      }

      const cancelEvent = new CustomEvent('cancel', { cancelable: true });
      this.handlers.cancel?.(cancelEvent);

      if (cancelEvent.defaultPrevented) {
        // If oncancel calls 'event.preventDefault()', then stop closing
        return;
      }

      this.destroyed = true;
      this.handlers.close?.(new CustomEvent('close'));
    }, { signal: this.abortController.signal });
  }

  get onclose(): CustomEventHandler | undefined {
    return this.handlers.close;
  }

  set onclose(handler: CustomEventHandler | undefined) {
    this.handlers.close = handler;
  }

  get oncancel(): CustomEventHandler | undefined {
    return this.handlers.cancel;
  }

  set oncancel(handler: CustomEventHandler | undefined) {
    this.handlers.cancel = handler;
  }

  close(): void {
    if (this.destroyed) { return; }
    this.destroyed = true;

    if (this.watcher) {
      this.watcher.close();
      return;
    }

    this.handlers.close?.(new CustomEvent('close'));
  }

  destroy(): void {
    if (this.destroyed) { return; }
    this.destroyed = true;
    this.watcher?.destroy();
    this.abortController?.abort();
  }
}
