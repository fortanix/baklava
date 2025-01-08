/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Dialog } from '../../containers/Dialog/Dialog.tsx';
import { usePopover } from '../../util/Popover/usePopover.ts';

import cl from './DialogOverlay.module.scss';


export { cl as DialogOverlayClassNames };

export type DialogOverlayProps = React.PropsWithChildren<ComponentProps<typeof Dialog> & {
}>;
/**
 * A dialog rendered as an overlay.
 */
export const DialogOverlay = (props: DialogOverlayProps) => {
  const { ...propsRest } = props;
  
  const dialogRef = React.useRef<React.ComponentRef<typeof Dialog>>(null);
  React.useEffect(() => {
    // window.dialogRef = dialogRef;
    // dialogRef.current?.showPopover();
  }, []);
  
  const popoverProps = usePopover({
    active: true,
    activate: () => {},
    deactivate: () => {},
  }, {});
  
  return (
    <Dialog
      ref={dialogRef}
      open={false}
      flat
      popover="manual"
      onRequestClose={() => { dialogRef.current?.hidePopover(); }}
      {...popoverProps.dialogProps}
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-dialog-overlay'],
        propsRest.className,
      )}
    />
  );
};
