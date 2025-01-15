/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timer } from '../../../util/time.ts';
import * as React from 'react';

import { type BannerVariant } from '../../containers/Banner/Banner.tsx';


export type ToastId = string;
export type ToastOptions = {
  autoClose?: undefined | false | number /*ms*/, // Time after which to automatically close the toast
};
export type ToastDescriptor = {
  variant: BannerVariant,
  message: React.ReactNode,
  title?: undefined | string,
  options?: undefined | ToastOptions,
};

export type ToastStoreOptions = {
  entryAnimationDelay?: number /*ms*/,
  exitAnimationDelay?: number /*ms*/,
  autoCloseDelay?: number /*ms*/, // Should be higher than `entryAnimationDelay`
};
export type ToastMetadata = {
  openedAt: Date,
  dismissed: boolean,
  autoCloseTimer: null | Timer,
};
export type ToastWithMetadata = { metadata: ToastMetadata, descriptor: ToastDescriptor };
export type ToastStorage = Readonly<Record<ToastId, ToastWithMetadata>>;
export type ToastSubscriber = (this: ToastStore, toasts: ToastStorage) => void;

/**
 * Store for the currently active toasts. Can be subscribed to to get notified when the state changes.
 */
export class ToastStore {
  #options: Required<ToastStoreOptions>;
  
  #idCounter = 0; // Maintain a count for automatic ID generation
  #toasts: ToastStorage = Object.create(null);
  #subscribers: Set<ToastSubscriber> = new Set();
  
  constructor(options: ToastStoreOptions = {}) {
    this.#options = {
      entryAnimationDelay: options.entryAnimationDelay ?? 400,
      exitAnimationDelay: options.exitAnimationDelay ?? 200,
      autoCloseDelay: options.autoCloseDelay ?? 5000,
    };
  }
  
  toasts() { return { ...this.#toasts }; }
  
  /** Subscribe to updates on the store (observable pattern). Returns a function to unsubscribe. */
  subscribe(subscriber: ToastSubscriber): () => void {
    this.#subscribers.add(subscriber);
    subscriber.call(this, this.#toasts); // Publish the current state
    return () => {
      this.#subscribers.delete(subscriber);
    };
  }
  
  /** Publish the current state to all subscribers. */
  publish() {
    for (const subscriber of this.#subscribers) {
      subscriber.call(this, this.#toasts);
    }
  }
  
  uniqueId(): ToastId {
    const id = this.#idCounter++;
    if (this.#idCounter >= Number.MAX_SAFE_INTEGER - 1) {
      this.#idCounter = 0;
    }
    return String(id);
  }
  
  // Generate an object key from the given ID. We prefix the ID, to make sure the key is not number-like in order
  // to enforce that the object entries are ordered by insertion.
  keyFromId(toastId: ToastId) {
    return `toast-${toastId}`;
  }
  idFromKey(toastKey: string): ToastId {
    return toastKey.replace(/^toast-/, '');
  }
  
  getToastById(toastId: ToastId): null | ToastWithMetadata {
    const toastKey = this.keyFromId(toastId);
    return this.#toasts[toastKey] ?? null;
  }
  
  updateToastMetadata(toastId: ToastId, updater: (metadata: ToastMetadata) => ToastMetadata) {
    const toast = this.getToastById(toastId);
    if (!toast) { throw new Error(`Missing toast: ${toastId}`); }
    
    this.#toasts = {
      ...this.#toasts,
      [this.keyFromId(toastId)]: { ...toast, metadata: updater(toast.metadata) },
    };
  }
  
  dismissToast(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    const toast = this.getToastById(toastId);
    if (!toast) { return; } // If the toast doesn't exist (anymore), ignore
    
    // Note: make sure to do an immutable update, otherwise this may not cause a rerender downstream
    if (typeof toast !== 'undefined') {
      this.updateToastMetadata(toastId, metadata => ({ ...metadata, dismissed: true }));
      this.publish();
    }
    
    // Clean up garbage data after the exit animation has had a chance to complete
    window.setTimeout(() => {
      const toasts = { ...this.#toasts };
      delete toasts[toastKey];
      this.#toasts = toasts;
      this.publish();
    }, this.#options.exitAnimationDelay);
  }
  
  scheduleClose(toastId: ToastId, closeDelay: number /*ms*/): Timer {
    return new Timer(() => { this.dismissToast(toastId); }, closeDelay);
  }
  
  announceToast(toastId: ToastId, toast: ToastDescriptor) {
    const toastKey = this.keyFromId(toastId);
    
    // Note: make sure to do an immutable update, otherwise this may not cause a rerender downstream
    const toasts = { ...this.#toasts };
    
    // Replace (and refresh) any existing toast with the same ID
    if (Object.hasOwn(this.#toasts, toastId)) {
      delete toasts[toastKey];
    }
    
    // Schedule autoclose, if configured
    let autoCloseTimer: null | Timer = null;
    const autoCloseDelay: false | number = toast.options?.autoClose ?? this.#options.autoCloseDelay;
    if (autoCloseDelay && autoCloseDelay > 0) {
      const autoCloseDelayMax = Math.max(autoCloseDelay, this.#options.entryAnimationDelay);
      autoCloseTimer = this.scheduleClose(toastId, autoCloseDelayMax);
    }
    
    // Add the new toast
    toasts[toastKey] = {
      metadata: { openedAt: new Date(), dismissed: false, autoCloseTimer },
      descriptor: toast,
    };
    
    this.#toasts = toasts;
    this.publish();
  }
  
  shouldSkipEntryAnimation(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    const toast = this.#toasts[toastKey];
    if (typeof toast === 'undefined') { return; }
    
    const openedAt: Date = toast.metadata.openedAt;
    return (new Date().valueOf() - openedAt.valueOf()) >= this.#options.entryAnimationDelay;
  }
  
  pauseAutoClose(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    const toast = this.#toasts[toastKey];
    if (typeof toast === 'undefined') { return; }
    
    const autoCloseTimer = toast.metadata.autoCloseTimer;
    autoCloseTimer?.pause(); // Pause the auto-close timer, if any
  }
  
  resumeAutoClose(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    const toast = this.#toasts[toastKey];
    if (typeof toast === 'undefined') { return; }
    
    const autoCloseTimer = toast.metadata.autoCloseTimer;
    autoCloseTimer?.resume(); // Resume the auto-close timer, if any
  }
  
  onPageVisible() {
    for (const toastKey of Object.keys(this.#toasts)) {
      this.resumeAutoClose(this.idFromKey(toastKey));
    }
  }
  
  onPageHide() {
    for (const toastKey of Object.keys(this.#toasts)) {
      this.pauseAutoClose(this.idFromKey(toastKey));
    }
  }
}
