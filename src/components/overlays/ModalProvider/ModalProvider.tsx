/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { useDebounce } from '../../../util/hooks/useDebounce.ts';
import { useModalDialog, type ModalDialogProps } from '../../util/Dialog/useModalDialog.ts';

import cl from './ModalProvider.module.scss';


export { cl as ModalProviderClassNames };


// Use an active state, but with a delay in unmounting to allow exit transitions time to animate
export const useActiveWithUnmountDelay = (
  activeDefault: boolean | (() => boolean),
  unmountDelay = 3000, /*ms*/
): [boolean, boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [active, setActive] = React.useState(activeDefault);
  const [shouldMount, setShouldMount] = useDebounce(active, unmountDelay);
  
  const setActiveWithUnmountDelay = React.useCallback((active: React.SetStateAction<boolean>) => {
    setActive(active);
    if (active) { setShouldMount(true); } // Skip the delay when activating (should only be for deactivation)
  }, [setShouldMount]);
  
  React.useDebugValue(`Active: ${active} / Mounted: ${shouldMount}`);
  
  return [active, shouldMount, setActiveWithUnmountDelay];
};

export type ModalRef = {
  active: boolean,
  activate: () => void,
  deactivate: () => void,
};

export const useRef = React.useRef<ModalRef>;

export type ModalProviderProps = {
  ref?: undefined | React.Ref<ModalRef>,
  
  /** The trigger that activates the modal overlay. */
  children: (triggerProps: { active: boolean, activate: () => void }) => React.ReactNode,
  
  /** The dialog to be shown in the modal overlay. */
  dialog: (props: ModalDialogProps) => React.ReactNode,
  
  /** Whether the modal should be active by default. Default: false. */
  activeDefault?: undefined | boolean,
  
  /** Whether to allow users to close the modal manually. */
  allowUserClose?: undefined | boolean,
  
  /** How long to keep the dialog in the DOM for exit animation purposes. Default: 3 seconds. */
  unmountDelay?: undefined | number,
};
/**
 * Provider around a trigger (e.g. button) to display a modal overlay on trigger activation.
 */
export const ModalProvider = Object.assign(
  (props: ModalProviderProps) => {
    const {
      ref,
      children,
      dialog,
      activeDefault = false,
      allowUserClose = false,
      unmountDelay = 3000, // ms
    } = props;
    
    const [active, shouldMount, setActive] = useActiveWithUnmountDelay(activeDefault, unmountDelay);
    
    const modalRef = React.useMemo<ModalRef>(() => ({
      active,
      activate: () => { setActive(true); },
      deactivate: () => { setActive(false); },
    }), [active, setActive]);
    
    React.useImperativeHandle(ref, () => modalRef, [modalRef]);
    
    const dialogProps = useModalDialog(modalRef, {
      allowUserClose,
      shouldCloseOnBackdropClick: allowUserClose,
    });
    
    return (
      <>
        {shouldMount && dialog(dialogProps)}
        {children(modalRef)}
      </>
    );
  },
  {
    useRef,
  },
);
