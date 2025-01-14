/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TimeoutHandle = ReturnType<typeof window.setTimeout>;

export const delay = (timeMs: number) => {
  return new Promise(resolve => setTimeout(resolve, timeMs));
};

export const timeout = (timeMs: number) => {
  const message = `The action took too long to complete`;
  return new Promise((_, reject) => setTimeout(reject, timeMs, new Error(message)));
};

/**
 * A pausable version of `setTimeout`.
 * Based on: https://stackoverflow.com/questions/72751790/how-to-pause-settimeout
 */
export class Timer {
  #callback: () => void;
  #remaining: number /*ms*/;
  #timerHandle: null | TimeoutHandle;
  #startedAt: null | Date;
  
  constructor(
    callback: () => void,
    delay: number, // ms
  ) {
    this.#remaining = delay;
    this.#callback = callback;
    this.#timerHandle = null;
    this.#startedAt = null;
    this.resume();
  }
  
  resume() {
    if (this.#timerHandle) { return; }
    
    this.#startedAt = new Date();
    this.#timerHandle = window.setTimeout(this.#callback, this.#remaining);
  }
  
  pause() {
    if (!this.#timerHandle || !this.#startedAt) { return; }
    
    window.clearTimeout(this.#timerHandle);
    this.#timerHandle = null;
    this.#remaining -= new Date().valueOf() - this.#startedAt.valueOf();
  };
}
