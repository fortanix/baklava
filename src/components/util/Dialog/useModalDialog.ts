/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type ModalDialogController = {
  /** Whether the dialog should be active. */
  active: boolean,
  /** Notify that the dialog has been opened. Change must be respected (otherwise no longer in sync). */
  activate: () => void,
  /** Notify that the dialog has been closed. Change must be respected (otherwise no longer in sync). */
  deactivate: () => void,
};

export type UseModalDialogOptions = {
  /**
   * Whether to allow the user to close the modal through the browser (e.g. with the Escape key). Disabling this may
   * be useful in cases where we need the user to stay in the modal (e.g. form validation, mandatory onboarding flows).
   * Note: closing cannot be always be prevented (e.g. browser may force the dialog to close, or closed through JS).
   */
  allowUserClose?: undefined | boolean,
  
  /** Whether the user clicking the backdrop should close the modal. Only valid if `allowUserClose` is true. */
  shouldCloseOnBackdropClick?: undefined | boolean,
};

export type ModalDialogProps = {
  close: () => void,
  dialogProps: React.ComponentProps<'dialog'>,
};

/*
 * A utility hook to control the state of a <dialog> element used as a modal (with `.showModal()`).
 */
export const useModalDialog = (
  controller: ModalDialogController,
  options: UseModalDialogOptions,
): ModalDialogProps => {
  const {
    allowUserClose = true,
    shouldCloseOnBackdropClick = true,
  } = options;
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  //const lastActiveElementRef = React.useRef<Element>(null); // Note: browsers track this automatically now
  
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
    if (!dialog) { return; } // Nothing to sync with
    
    const isDialogOpenModal = dialog.open && dialog.matches(':modal');
    
    if (controller.active && !isDialogOpenModal) { // Should be active but isn't
      // Save a reference to the last focused element before opening the modal
      //lastActiveElementRef.current = document.activeElement;
      
      try {
        dialog.open = false; // Make sure the dialog is not open as a non-modal (i.e. through `.show()`)
        dialog.showModal();
      } catch (error: unknown) {
        console.error(`Unable to open modal dialog`, error);
        controller.deactivate();
      }
    } else if (!controller.active && isDialogOpenModal) { // Should not be active but is
      try {
        dialog.close();
      } catch (error: unknown) {
        console.error(`Unable to close modal dialog`, error);
        controller.activate();
      }
    }
  }, [controller]);
  
  // The `beforetoggle` event can be used to detect when a modal opens. Note: browser support is poor currently, but
  // it's okay since we generally control the activation, not the user. In non-supporting browsers, if someone were to
  // // manually call `.showModal()` through devtools they could potentially cause a desync.
  // https://caniuse.com/mdn-api_htmlelement_toggle_event_dialog_elements
  const handleDialogBeforeToggle = React.useCallback((event: React.ToggleEvent<HTMLDialogElement>) => {
    if (event.newState === 'open') {
      controller.activate();
    }
  }, [controller]);
  
  // Handle dialog `cancel` event. This event is called when the user requests the dialog to close (e.g. with Escape
  // key). Can be canceled, though browsers do not always respect the cancelation (e.g. Chrome still closes when the
  // Escape key is hit twice).
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close_event
  const handleDialogCancel = React.useCallback((event: React.SyntheticEvent<HTMLDialogElement>) => {
    if (!allowUserClose) {
      event.preventDefault();
    }
  }, [allowUserClose]);
  
  // Handle dialog `close` event. This event is called when the dialog has already been closed (cannot be canceled).
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close_event
  const handleDialogClose = React.useCallback(() => {
    /*
    // XXX This is probably not necessary, browsers do this out of the box already
    // Restore focus to last active element before the user opened the modal
    const lastActiveElement = lastActiveElementRef.current;
    if (lastActiveElement && 'focus' in lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    */
    
    controller.deactivate(); // Sync with the controller
  }, [controller]);
  
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
      controller.deactivate();
    }
  }, [controller, allowUserClose, shouldCloseOnBackdropClick]);
  
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
      open: undefined, // Do not set `open`, leave it to the browser to manage automatically
      
      onBeforeToggle: handleDialogBeforeToggle,
      onCancel: handleDialogCancel,
      onClose: handleDialogClose,
      // Note: we don't need keyboard accessibility for this `onClick`, the backdrop is not (and should not be) an
      // interactive element. This is a visual only convenience, screen readers should use the other close mechanisms.
      onClick: shouldCloseOnBackdropClick ? handleDialogClick : undefined,
      onKeyDown: handleDialogKeyDown,
    },
  };
};
