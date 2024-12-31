/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type UseControlledDialogArgs = {
  /** Whether the dialog is currently active. */
  active: boolean,
  
  /** A callback that will be called when the dialog changes active state. */
  onActiveStateChange: (active: boolean) => void,
  
  /**
   * Whether to allow the user to close the modal through the browser (e.g. with the Escape key). Disabling this may
   * be useful in cases where we need the user to stay in the modal (e.g. pending confirmation, pending form submit).
   */
  allowUserClose?: undefined | boolean,
  
  /** Whether the user clicking the backdrop should close the modal. */
  shouldCloseOnBackdropClick?: undefined | boolean,
};

export type ControlledDialogProps = {
  close: () => void,
  dialogProps: React.ComponentProps<'dialog'>,
};

/**
 * Control the activation state of the given `<dialog>` element through the given `active` boolean.
 */
export const useControlledDialog = (args: UseControlledDialogArgs): ControlledDialogProps => {
  const {
    active,
    onActiveStateChange,
    allowUserClose = true,
    shouldCloseOnBackdropClick = true,
  } = args;
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  //const lastActiveElementRef = React.useRef<Element>(null);
  
  const requestDialogClose = React.useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) { console.warn(`Unable to close dialog: reference does not exist.`); return; }
    
    try {
      dialog.close();
    } catch (error: unknown) {
      console.error(`Failed to close dialog`, error);
    }
  }, []);
  
  // Sync active state with <dialog> DOM state
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) { return; }
    
    const isDialogOpen = dialog.matches(':modal');
    if (active && !isDialogOpen) {
      // Save a reference to the last focused element before opening the modal
      //lastActiveElementRef.current = document.activeElement;
      
      try {
        dialog.open = false; // Make sure the <dialog> does not already have a non-modal `open`
        dialog.showModal();
      } catch (error: unknown) {
        console.error(`Unable to open modal dialog`, error);
        onActiveStateChange(false);
      }
    } else if (!active && isDialogOpen) {
      dialog.close();
    }
  }, [active, onActiveStateChange]);
  
  // Handle dialog `close` event
  const handleDialogClose = React.useCallback(() => {
    /*
    // XXX This is probably not necessary, browsers do this out of the box already
    // Restore focus to last active element before the user opened the modal
    const lastActiveElement = lastActiveElementRef.current;
    if (lastActiveElement && 'focus' in lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    */
    
    onActiveStateChange(false); // Sync with the consumer
  }, [onActiveStateChange]);
  
  // Handle dialog `click` event
  const handleDialogClick = React.useCallback((event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog: HTMLDialogElement = event.currentTarget;
    const target: EventTarget = event.target;
    
    // We want to determine whether the click was on the `<dialog>` backdrop. For the event, the backdrop is considered
    // just a part of the `<dialog>` element. So we need to check both that the target is the `<dialog>` *and also*
    // that the click landed outside of the element content boundary.
    // Source: https://stackoverflow.com/questions/25864259/how-to-close-dialog-tag-by-clicking-on-its-backdrop
    let isClickOnBackdrop = false;
    if (target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInsideDialog = rect.top <= event.clientY
        && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX
        && event.clientX <= rect.left + rect.width;
      isClickOnBackdrop = !isInsideDialog;
    }
    
    if (allowUserClose && shouldCloseOnBackdropClick && isClickOnBackdrop) {
      dialog.close();
    }
  }, [allowUserClose, shouldCloseOnBackdropClick]);
  
  // Handle dialog `keydown` event
  const handleDialogKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape' && !allowUserClose) {
      event.preventDefault();
    }
  }, [allowUserClose]);
  
  return {
    close: requestDialogClose,
    dialogProps: {
      ref: dialogRef,
      open: undefined, // Leave the `open` attribute to the browser to manage
      
      onClose: handleDialogClose,
      // Note: we don't need keyboard accessibility for this `onClick`, the backdrop is not (and should not be) an
      // interactive element. This is a visual only convenience, screen readers should use the other close mechanisms.
      onClick: shouldCloseOnBackdropClick ? handleDialogClick : undefined,
      onKeyDown: handleDialogKeyDown,
    },
  };
};
