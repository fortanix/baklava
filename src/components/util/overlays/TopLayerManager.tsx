/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type ModalDialogRef = Readonly<{
  id: string,
  // Note: ideally we'd just have an `HTMLDialogElement` here without the `null` case. However, refs are not controlled
  // (aren't synced with the render cycle), thus it may be safer to deal with this downstream at the use site.
  dialogRef: React.RefObject<null | HTMLDialogElement>,
}>;
// Represents a stack of modal dialog elements that are currently open in the top layer
export type ModalDialogStack = ReadonlyArray<ModalDialogRef>;

export type ModalDialogStackSubscriber = (this: ModalDialogStackObservable, modalDialogStack: ModalDialogStack) => void;
/** Observable for a `ModalDialogStack`, can be subscribed to to listen for updates. */
export class ModalDialogStackObservable {
  #subscribers: Set<ModalDialogStackSubscriber> = new Set();
  #modalDialogStack: ModalDialogStack = [];
  
  /** Subscribe to updates. Returns a function to unsubscribe. */
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
  activeModalDialog(): null | ModalDialogRef {
    return this.#modalDialogStack.at(-1) ?? null;
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
}

/**
 * A context object that captures information about the state of the top layer.
 */
export type TopLayerContext = {
  modalDialogStack: ModalDialogStackObservable,
};
export const TopLayerContext = React.createContext<null | TopLayerContext>(null);

/**
 * React context provider that manages the state of the top layer.
 */
export const TopLayerManager = (props: React.PropsWithChildren) => {
  const modalDialogStackRef = React.useRef<null | ModalDialogStackObservable>(null);
  const modalDialogStack = modalDialogStackRef.current ?? new ModalDialogStackObservable(); // Lazy initialize
  
  const context = React.useMemo<TopLayerContext>(() => ({ modalDialogStack }), [modalDialogStack]);
  
  return (
    <TopLayerContext value={context}>
      {props.children}
    </TopLayerContext>
  );
};

/**
 * Hook that is meant to be used in any component that renders a popover element. Used to track which popovers are
 * currently open in the top layer.
 */
export const usePopoverTracker = (active: boolean) => {
  const context = React.use(TopLayerContext);
  
  // When `active` changes, sync up with the context
  React.useEffect(() => {
    if (context === null) { return; } // May sometimes become `null` even if a Provider is present in the tree?
    if (active) {
      context.modalDialogStack.publish();
    }
  }, [context, active]); 
};

/**
 * Hook that is meant to be used in any component that renders a modal `<dialog>` element. Used to track which
 * modal dialogs are currently open in the top layer.
 */
export const useModalDialogTracker = (active: boolean, dialogRef: React.RefObject<null | HTMLDialogElement>) => {
  const context = React.use(TopLayerContext);
  
  const id = React.useId();
  const ref = React.useMemo<ModalDialogRef>(() => ({ id, dialogRef }), [id, dialogRef]);
  
  // When `active` changes, sync up with the context
  React.useEffect(() => {
    if (context === null) { return; } // May sometimes become `null` even if a Provider is present in the tree?
    if (active) {
      context.modalDialogStack.activate(ref);
    } else {
      context.modalDialogStack.deactivate(ref);
    }
    
    // On unmount, deactivate
    return () => {
      context.modalDialogStack.deactivate(ref);
    };
  }, [context, active, ref]);
};

/**
 * Returns the currently active modal `<dialog>` element, if any.
 */
export const useActiveModalDialog = (): null | ModalDialogRef => {
  const context = React.use(TopLayerContext);
  
  const [activeModalDialog, setActiveModalDialog] = React.useState<null | ModalDialogRef>(null);
  
  React.useEffect(() => {
    if (context === null) { return; } // May sometimes become `null` even if a Provider is present in the tree?
    return context.modalDialogStack.subscribe(function() {
      const newActiveModalDialog = this.activeModalDialog();
      if (newActiveModalDialog !== activeModalDialog) {
        setActiveModalDialog(newActiveModalDialog);
      }
    });
  }, [context, activeModalDialog]);
  
  return activeModalDialog ?? null;
};
