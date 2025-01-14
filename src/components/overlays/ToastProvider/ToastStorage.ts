
import * as React from 'react';

import { type BannerVariant } from '../../containers/Banner/Banner.tsx';


type TimeoutHandle = number;

export type ToastId = string;
export type ToastDescriptor = {
  variant: BannerVariant,
  title: string,
  message: React.ReactNode,
};

export type ToastObservableOptions = {
  entryAnimationDelay?: number /*ms*/,
  exitAnimationDelay?: number /*ms*/,
  autoCloseTime?: number /*ms*/, // Should be higher than `entryAnimationDelay`
};
export type ToastMetadata = {
  openedAt: Date,
  dismissed: boolean,
  autoCloseHandle: TimeoutHandle,
};
export type ToastWithMetadata = { metadata: ToastMetadata, descriptor: ToastDescriptor };
export type ToastStorage = Readonly<Record<ToastId, ToastWithMetadata>>;
export type ToastSubscriber = (toasts: ToastStorage) => void;

/**
 * Observable for the currently active toasts. Subscribers will be notified when the state changes.
 */
export class ToastsObservable {
  #options: Required<ToastObservableOptions>;
  
  #idCounter = 0; // Maintain a count for automatic ID generation
  #toasts: ToastStorage = Object.create(null);
  #subscribers: Set<ToastSubscriber> = new Set();
  
  constructor(options: ToastObservableOptions = {}) {
    this.#options = {
      entryAnimationDelay: options.entryAnimationDelay ?? 400,
      exitAnimationDelay: options.exitAnimationDelay ?? 200,
      autoCloseTime: options.autoCloseTime ?? 2000,
    };
  }
  
  toasts() { return { ...this.#toasts }; }
  
  /** Subscribe to this observable. Returns a function to unsubscribe. */
  subscribe(subscriber: ToastSubscriber): () => void {
    this.#subscribers.add(subscriber);
    return () => {
      this.#subscribers.delete(subscriber);
    };
  }
  
  /** Publish the current state to all subscribers. */
  publish() {
    for (const subscriber of this.#subscribers) {
      subscriber(this.#toasts);
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
  
  scheduleClose(toastId: ToastId, closeTime: number /*ms*/): TimeoutHandle {
    return window.setTimeout(() => { this.dismissToast(toastId); }, closeTime);
  }
  
  announceToast(toastId: ToastId, toast: ToastDescriptor) {
    const toastKey = this.keyFromId(toastId);
    
    // Note: make sure to do an immutable update, otherwise this may not cause a rerender downstream
    const toasts = { ...this.#toasts };
    
    // Replace (and refresh) any existing toast with the same ID
    if (Object.hasOwn(this.#toasts, toastId)) {
      delete toasts[toastKey];
    }
    
    // Schedule autoclose
    const autoCloseTime = Math.max(this.#options.autoCloseTime, this.#options.entryAnimationDelay);
    const autoCloseHandle = this.scheduleClose(toastId, autoCloseTime);
    
    // Add the new toast
    toasts[toastKey] = {
      metadata: { openedAt: new Date(), dismissed: false, autoCloseHandle },
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
  
  // If the user hovers over the toast, keep it 
  onInterestStart(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    const toast = this.#toasts[toastKey];
    if (typeof toast === 'undefined') { return; }
    
    window.clearTimeout(toast.metadata.autoCloseHandle);
  }
  
  onInterestEnd(toastId: ToastId) {
    const autoCloseTime = Math.max(this.#options.autoCloseTime, this.#options.entryAnimationDelay);
    const autoCloseHandle = this.scheduleClose(toastId, autoCloseTime);
    this.updateToastMetadata(toastId, metadata => ({ ...metadata, autoCloseHandle }));
    this.publish();
  }
}
