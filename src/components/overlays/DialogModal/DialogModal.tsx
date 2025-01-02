/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Button } from '../../actions/Button/Button.tsx';
import { Dialog } from '../../containers/Dialog/Dialog.tsx';
import { ModalProvider, type ModalProviderProps } from '../ModalProvider/ModalProvider.tsx';

import cl from './DialogModal.module.scss';


export { cl as DialogModalClassNames };

export type DialogModalProps = ComponentProps<typeof Dialog> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** How to display the modal in the viewport. Default: 'center'. */
  display?: undefined | 'center' | 'full-screen' | 'slide-over',
  
  /** The size of the modal. Note: does not apply to full screen modals. */
  size?: undefined | 'small' | 'medium' | 'large',
  
  /** The modal trigger. */
  trigger: ModalProviderProps['children'],
  
  /** Any additional props to pass to the modal provider. */
  providerProps?: undefined | Omit<ModalProviderProps, 'children'>,
};
/**
 * A dialog component displayed as a modal when activating the given trigger.
 */
export const DialogModal = (props: DialogModalProps) => {
  const {
    children,
    trigger,
    unstyled = false,
    display = 'center',
    size = 'medium',
    ...propsRest
  } = props;
  
  return (
    <ModalProvider
      content={({ close, dialogProps }) =>
        <Dialog
          flat={['full-screen', 'slide-over'].includes(display)}
          {...dialogProps}
          onRequestClose={close}
          {...propsRest}
          className={cx(
            { bk: true },
            { [cl['bk-dialog-modal']]: !unstyled },
            { [cl['bk-dialog-modal--center']]: display === 'center' },
            { [cl['bk-dialog-modal--full-screen']]: display === 'full-screen' },
            { [cl['bk-dialog-modal--slide-over']]: display === 'slide-over' },
            { [cl['bk-dialog-modal--small']]: size === 'small' },
            { [cl['bk-dialog-modal--medium']]: size === 'medium' },
            { [cl['bk-dialog-modal--large']]: size === 'large' },
            dialogProps.className,
            propsRest.className,
          )}
        >
          {children}
        </Dialog>
      }
    >
      {trigger}
    </ModalProvider>
  );
};
