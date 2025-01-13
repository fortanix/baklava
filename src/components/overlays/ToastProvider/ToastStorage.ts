
import * as React from 'react';

import { type BannerVariant } from '../../containers/Banner/Banner.tsx';


const entryAnimationDelay = 400;
const exitAnimationDelay = 200;
const autoCloseTime = 5000; // Should be higher than `entryAnimationDelay`

export type ToastId = string;
export type ToastDescriptor = { variant: BannerVariant, title: string, message: React.ReactNode };
export type ToastMetadata = { entryAnimationFinished: boolean, dismissed: boolean };
export type ToastStorage = Record<ToastId, { metadata: ToastMetadata, descriptor: ToastDescriptor }>;

export type ToastSubscriber = (toasts: ToastStorage) => void;
export class ToastsObservable {
  #toasts: ToastStorage = Object.create(null);
  #idCounter = 0; // Maintain a count for ID generation
  #subscribers: Set<ToastSubscriber> = new Set();
  
  toasts() { return this.#toasts; }
  
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
  
  dismissToast(toastId: ToastId) {
    const toastKey = this.keyFromId(toastId);
    
    // Note: make sure to do an immutable update, otherwise this may not cause a rerender downstream
    const toast = this.#toasts[toastKey];
    if (typeof toast !== 'undefined') {
      this.#toasts = { ...this.#toasts, [toastKey]: { ...toast, metadata: { ...toast.metadata, dismissed: true } } };
      this.publish();
    }
    
    // Clean up garbage data after the exit animation has had a chance to complete
    window.setTimeout(() => {
      this.#toasts = { ...this.#toasts };
      delete this.#toasts[toastKey];
      this.publish();
    }, exitAnimationDelay);
  }
  
  announceToast(toastId: ToastId, toast: ToastDescriptor) {
    const toastKey = this.keyFromId(toastId);
    
    // Note: make sure to do an immutable update, otherwise this may not cause a rerender downstream
    const toasts = { ...this.#toasts };
    
    // Replace (and refresh) any existing toast with the same ID
    if (Object.hasOwn(this.#toasts, toastId)) {
      delete toasts[toastKey];
    }
    
    // Add the new toast
    toasts[toastKey] = { metadata: { entryAnimationFinished: false, dismissed: false }, descriptor: toast };
    
    // Mark entry animation finished
    window.setTimeout(() => {
      const toast = this.#toasts[toastKey];
      if (typeof toast !== 'undefined') {
        this.#toasts = {
          ...this.#toasts,
          [toastKey]: { ...toast, metadata: { ...toast.metadata, entryAnimationFinished: true } },
        };
        this.publish();
      }
    }, entryAnimationDelay);
    
    this.#toasts = toasts;
    this.publish();
    
    // Schedule autoclose
    window.setTimeout(() => {
      this.dismissToast(toastId);
    }, autoCloseTime);
  }
}
