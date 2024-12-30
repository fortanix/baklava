/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { useControlledDialog, type ControlledDialogProps } from './useControlledDialog.ts';

import cl from './ModalProvider.module.scss';


export { cl as ModalProviderClassNames };


export type ModalProviderProps = {
  /** The trigger that activates the modal overlay. */
  children: (activate: () => void) => React.ReactNode,
  
  /** The content to be shown in the modal overlay. */
  content: (props: ControlledDialogProps) => React.ReactNode,
};
/**
 * Provider around a trigger (e.g. button) to display a modal overlay on trigger activation.
 */
export const ModalProvider = (props: ModalProviderProps) => {
  const { children, content } = props;
  
  const [active, setActive] = React.useState(false);
  const activate = React.useCallback(() => { setActive(true); }, []);
  const deactivate = React.useCallback(() => { setActive(false); }, []);
  
  const dialogProps = useControlledDialog(active, deactivate, {
    allowUserClose: true,
  });
  
  return (
    <>
      {active && content(dialogProps)}
      {children(activate)}
    </>
  );
};
