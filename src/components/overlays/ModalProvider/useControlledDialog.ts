
import * as React from 'react';


export type UseControlledDialogOptions = {
  /**
   * Whether to allow the user to close the modal through the browser (e.g. with the Escape key). Disabling this may
   * be useful in cases where we need the user to stay in the modal (e.g. pending confirmation, pending form submit).
   */
  allowUserClose?: undefined | boolean,
  
  /** Whether the user clicking the backdrop should close the modal. */
  shouldCloseOnBackdropClick?: undefined | boolean,
};

export type ControlledDialogProps = React.ComponentProps<'dialog'> & {
  close: () => void,
};

/**
 * Control the activation state of the given `<dialog>` element through the given `active` boolean.
 */
export const useControlledDialog = (
  active: boolean,
  onDeactivate: () => void,
  options?: undefined | UseControlledDialogOptions,
): ControlledDialogProps => {
  const {
    allowUserClose = true,
    shouldCloseOnBackdropClick = true,
  } = options ?? {};
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  //const lastActiveElementRef = React.useRef<Element>(null);
  
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
        onDeactivate();
      }
    } else if (!active && isDialogOpen) {
      dialog.close();
    }
  }, [active, onDeactivate]);
  
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
    
    onDeactivate(); // Sync with the consumer
  }, [onDeactivate]);
  
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
  
  const handleDialogKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape' && !allowUserClose) {
      event.preventDefault();
    }
  }, [allowUserClose]);
  
  const dialogProps: ControlledDialogProps = {
    ref: dialogRef,
    open: undefined, // Leave the `open` attribute to the browser to manage
    
    onClose: handleDialogClose,
    // Note: we don't need keyboard accessibility for this `onClick`, the backdrop is not (and should not be) an
    // interactive element. This is a visual only convenience, screen readers should use the other close mechanisms.
    onClick: shouldCloseOnBackdropClick ? handleDialogClick : undefined,
    onKeyDown: handleDialogKeyDown,
    
    close: () => { dialogRef.current?.close(); },
  };
  
  return dialogProps;
};
