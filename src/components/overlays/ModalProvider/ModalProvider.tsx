/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { useDebounce } from '../../../util/hooks/useDebounce.ts';
import { useControlledDialog, type ControlledDialogProps } from '../../util/Dialog/useControlledDialog.ts';

import cl from './ModalProvider.module.scss';


export { cl as ModalProviderClassNames };


export type ModalProviderProps = {
  /** The trigger that activates the modal overlay. */
  children: (triggerProps: { active: boolean, activate: () => void }) => React.ReactNode,
  
  /** The content to be shown in the modal overlay. */
  content: (props: ControlledDialogProps) => React.ReactNode,
  
  /** Whether the modal should be active by default. */
  activeDefault?: undefined | boolean,
  
  /** How long to keep the dialog in the DOM for exit animation purposes. Default: 2 seconds. */
  exitAnimationDelay?: undefined | number,
};
/**
 * Provider around a trigger (e.g. button) to display a modal overlay on trigger activation.
 */
export const ModalProvider = (props: ModalProviderProps) => {
  const {
    children,
    content,
    activeDefault = false,
    exitAnimationDelay = 100_000,
  } = props;
  
  const [active, setActiveInternal] = React.useState(activeDefault);
  const [activeWithDelay, setActiveWithDelay] = useDebounce(active, exitAnimationDelay);
  
  const setActive = React.useCallback((active: boolean) => {
    setActiveInternal(active);
    if (active) { setActiveWithDelay(true); } // Skip the delay when activating (should only be for deactivation)
  }, [setActiveWithDelay]);
  
  const activate = React.useCallback(() => { setActive(true); }, [setActive]);
  const triggerProps = { active, activate };
  
  const dialogProps = useControlledDialog({
    active,
    onActiveStateChange: setActive,
    allowUserClose: true,
  });
  
  return (
    <>
      {activeWithDelay && content(dialogProps)}
      {children(triggerProps)}
    </>
  );
};
