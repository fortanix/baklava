/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../../util/reactUtil.ts';


// Represents a stack of modal dialog elements that are currently open in the top layer
export type ModalDialogRef = Readonly<{ id: string, dialogRef: React.RefObject<null | HTMLDialogElement> }>;
export type ModalDialogStack = ReadonlyArray<ModalDialogRef>;

export type ModalDialogStackSubscriber = (this: ModalDialogStackObservable, modalDialogStack: ModalDialogStack) => void;
export class ModalDialogStackObservable {
  #subscribers: Set<ModalDialogStackSubscriber> = new Set();
  #modalDialogStack: ModalDialogStack = [];
  
  /** Subscribe to updates on the store (observable pattern). Returns a function to unsubscribe. */
  subscribe(subscriber: ModalDialogStackSubscriber): () => void {
    this.#subscribers.add(subscriber);
    subscriber.call(this, this.#modalDialogStack); // Publish the current state
    return () => { this.#subscribers.delete(subscriber); };
  }
  
  /** Publish the current state to all subscribers. */
  publish() {
    for (const subscriber of this.#subscribers) {
      subscriber.call(this, this.#modalDialogStack);
    }
  }
  
  getById(id: string): null | ModalDialogRef {
    return this.#modalDialogStack.find(ref => ref.id === id) ?? null;
  }
  
  activate(modalDialog: ModalDialogRef) {
    // Note: make sure to filter out any existing items with the same ID. If a modal re-activates, then it should
    // move to the top of the stack.
    this.#modalDialogStack = [...this.#modalDialogStack.filter(ref => ref.id !== modalDialog.id), modalDialog];
    this.publish();
  }
  deactivate(modalDialog: ModalDialogRef) {
    this.#modalDialogStack = [...this.#modalDialogStack.filter(ref => ref.id !== modalDialog.id)];
    this.publish();
  }
  
  activeModalDialog(): null | ModalDialogRef {
    return this.#modalDialogStack.at(-1) ?? null;
  }
  
  refresh() {
    this.#modalDialogStack = [...this.#modalDialogStack];
    this.publish();
  }
}

export type ModalDialogContext = {
  modalDialogStack: ModalDialogStackObservable,
};
export const ModalDialogContext = React.createContext<null | ModalDialogContext>(null);

/**
 * Tracker for modal dialogs.
 */
export const ModalDialogProvider = (props: React.PropsWithChildren) => {
  const modalDialogStackRef = React.useRef<null | ModalDialogStackObservable>(null);
  const modalDialogStack = modalDialogStackRef.current ?? new ModalDialogStackObservable(); // Lazy initialize
  
  // const context = React.useMemo<ModalDialogContext>(() => ({
  //   activeModal: instances.at(-1)?.dialogRef.current ?? null,
  //   activate: (ref: ModalDialogReference) => {
  //     //setInstances(instances => [...instances.filter(inst => inst.id !== ref.id), ref]);
  //   },
  //   deactivate: (ref: ModalDialogReference) => {
  //     //setInstances(instances => instances.filter(inst => inst.id !== ref.id));
  //   },
  // }), [instances]);
  
  const context = React.useMemo<ModalDialogContext>(() => ({ modalDialogStack }), [modalDialogStack]);
  
  return (
    <ModalDialogContext value={context}>
      {props.children}
    </ModalDialogContext>
  );
};

export const useModalDialogContext = (active: boolean, dialogRef: React.RefObject<null | HTMLDialogElement>) => {
  const context = React.use(ModalDialogContext);
  
  const id = React.useId();
  const ref = React.useMemo<ModalDialogRef>(() => ({ id, dialogRef }), [id, dialogRef]);
  
  // When `active` changes, sync up with the context
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    if (active) {
      context.modalDialogStack.activate(ref);
    } else {
      context.modalDialogStack.deactivate(ref);
    }
  }, [context, active, ref]);
  
  // On unmount, deactivate
  useEffectOnce(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    return () => context.modalDialogStack.deactivate(ref);
  });  
};

export const useActiveModalDialog = (): null | HTMLDialogElement => {
  const context = React.use(ModalDialogContext);
  
  const [activeModalDialog, setActiveModalDialog] = React.useState<null | ModalDialogRef>(null);
  
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    return context.modalDialogStack.subscribe(function() {
      setActiveModalDialog(this.activeModalDialog());
    });
  }, [context]);
  
  return activeModalDialog?.dialogRef?.current ?? null;
};

export const usePopoverContext = (active: boolean) => {
  const context = React.use(ModalDialogContext);
  
  // When `active` changes, sync up with the context
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    if (active) {
      context.modalDialogStack.refresh();
    }
  }, [context, active]); 
};
