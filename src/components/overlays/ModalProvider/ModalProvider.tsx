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
  active: boolean,
  setActive: React.Dispatch<React.SetStateAction<boolean>>,
  unmountDelay = 3000, /*ms*/
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [shouldMount, setShouldMount] = useDebounce(active, unmountDelay);
  
  const setActiveWithUnmountDelay = React.useCallback((active: React.SetStateAction<boolean>) => {
    setActive(active);
    if (active) { setShouldMount(true); } // Skip the delay when activating (should only be for deactivation)
  }, [setActive, setShouldMount]);
  
  React.useDebugValue(`Active: ${active} / Mounted: ${shouldMount}`);
  
  return [shouldMount, setActiveWithUnmountDelay];
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
  children?: undefined | ((triggerProps: { active: boolean, activate: () => void }) => React.ReactNode),
  
  /** The dialog to be shown in the modal overlay. */
  dialog: (props: ModalDialogProps) => React.ReactNode,
  
  /** Whether the modal is active. Use this if you want the modal to be a controlled component. */
  active?: undefined | boolean,
  
  /** If the modal is a controlled component, this callback will be called when the active state should change. */
  onActiveChange?: undefined | React.Dispatch<React.SetStateAction<boolean>>,
  
  /** If uncontrolled, specifies whether the modal should be active by default. Default: false. */
  activeDefault?: undefined | boolean,
  
  /** Whether to allow users to close the modal manually. */
  allowUserClose?: undefined | boolean,
  
  /** Whether clicking on the backdrop should close the modal. Default: true */
  shouldCloseOnBackdropClick?: undefined | boolean,
  
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
      allowUserClose = true,
      shouldCloseOnBackdropClick = true,
      unmountDelay = 3000, // ms
    } = props;
    
    const [activeUncontrolled, setActiveUncontrolled] = React.useState(activeDefault);
    const active = typeof props.active !== 'undefined' ? props.active : activeUncontrolled;
    const setActive = typeof props.onActiveChange !== 'undefined' ? props.onActiveChange : setActiveUncontrolled;
    const [shouldMount, setActiveWithDelay] = useActiveWithUnmountDelay(active, setActive, unmountDelay);
    
    const modalRef = React.useMemo<ModalRef>(() => ({
      active: active,
      activate: () => { setActiveWithDelay(true); },
      deactivate: () => { setActiveWithDelay(false); },
    }), [active, setActiveWithDelay]);
    
    React.useImperativeHandle(ref, () => modalRef, [modalRef]);
    
    const dialogProps = useModalDialog(modalRef, {
      allowUserClose,
      shouldCloseOnBackdropClick,
    });
    
    return (
      <>
        {shouldMount && dialog(dialogProps)}
        {typeof children === 'function' ? children(modalRef) : children}
      </>
    );
  },
  {
    useRef,
  },
);
