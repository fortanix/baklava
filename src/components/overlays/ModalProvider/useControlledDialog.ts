
import * as React from 'react';


type UseControlledDialogOptions = {
  handleBackdropClick?: undefined | boolean,
};

type ControlledDialogProps = React.ComponentProps<'dialog'>;

/**
 * Control the activation state of the given `<dialog>` element through the given `active` boolean.
 */
export const useControlledDialog = (
  active: boolean,
  onDeactivate: () => void,
  options?: undefined | UseControlledDialogOptions,
) => {
  const { handleBackdropClick = true } = options ?? {};
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) { return; }
    
    const isDialogOpen = dialog.matches(':modal');
    if (active && !isDialogOpen) {
      dialog.open = false; // Make sure the <dialog> does not already have a non-modal `open`
      dialog.showModal();
    } else if (!active && isDialogOpen) {
      dialog.close();
    }
  }, [active]);
  
  const handleDialogClose = React.useCallback(() => { onDeactivate(); }, [onDeactivate]);
  const refCallback: React.RefCallback<HTMLDialogElement> = React.useCallback((dialog: HTMLDialogElement) => {
    dialogRef.current = dialog;
    dialog.addEventListener('close', handleDialogClose);
    
    return () => {
      dialog.removeEventListener('close', handleDialogClose);
    };
  }, [handleDialogClose]);
  
  return refCallback;
};
