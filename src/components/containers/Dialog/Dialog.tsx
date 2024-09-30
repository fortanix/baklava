/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ClassNameArgument } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';

import cl from './Dialog.module.scss';


export { cl as DialogClassNames };

/*
const useClickOutside = <E extends HTMLElement>(ref: React.RefObject<E>, callback: () => void) => {
  const handleEvent = React.useCallback((event: React.PointerEvent<E>) => {
    if (ref && ref.current) {
      if (ref.current.contains(event.target as Node)) {
        React.setState({ hasClickedOutside: false });
      } else {
        React.setState({ hasClickedOutside: true });
      }
    }
  }, [ref]);
  
  React.useEffect(() => {
    if (!window.PointerEvent) { return; }
    
    document.addEventListener('pointerdown', handleEvent);
    
    return () => {
      if (window.PointerEvent) {
        document.removeEventListener('pointerdown', handleEvent);
      } else {
        document.removeEventListener('mousedown', handleEvent);
        document.removeEventListener('touchstart', handleEvent);
      }
    }
  }, []);

  return [ref, hasClickedOutside];
};
*/


export type DialogProps = React.PropsWithChildren<{
  unstyled?: boolean,
  active: boolean,
  className?: ClassNameArgument,
  onClose: () => void,
}>;

/**
 * Dialog component.
 */
export const Dialog = ({ children, unstyled, className, active, onClose }: DialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  
  /*
  // Sync the `active` flag with the DOM dialog
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    if (active && !dialog.open) {
      dialog.showDialog();
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);
  */
  
  // Sync the dialog close event with the `active` flag
  const handleCloseEvent = React.useCallback((event: Event): void => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    if (active && event.target === dialog) {
      onClose();
    }
  }, [active, onClose]);
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    dialog.addEventListener('close', handleCloseEvent);
    return () => { dialog.removeEventListener('close', handleCloseEvent); };
  }, [handleCloseEvent]);
  
  const close = React.useCallback(() => {
    onClose();
  }, [onClose]);
  
  const handleDialogClick = React.useCallback((event: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (dialog !== null && event.target === dialog) {
      // Note: clicking the backdrop just results in an event where the target is the `<dialog>` element. In order to
      // distinguish between the backdrop and the dialog content, we assume that the `<dialog>` is fully covered by
      // another element. In our case, `bk-dialog__content` must cover the whole `<dialog>` otherwise this will not work.
      close();
    }
  }, [close]);
  
  return (
    <dialog
      open
      ref={dialogRef}
      className={cx({
        bk: true,
        [cl['bk-dialog']]: !unstyled,
      }, className)}
      onClick={handleDialogClick}
    >
      <header className={cl['bk-dialog__header']}>
        <h1>Title</h1>
        {/* <button autoFocus className="action" onClick={close}>✕</button> */}
      </header>
      
      <section className={cx(cl['bk-dialog__content'], 'body-text')}>
        {children}
      </section>
      
      <footer className={cx(cl['bk-dialog__actions'])}>
        <Button autoFocus variant="secondary" label="Cancel"/>
        <Button variant="primary" label="Submit"/>
      </footer>
    </dialog>
  );
};
