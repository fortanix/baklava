/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Dialog } from '../../containers/Dialog/Dialog.tsx';
import { ModalProvider, type ModalProviderProps } from '../ModalProvider/ModalProvider.tsx';

import cl from './DialogModal.module.scss';


export { cl as DialogModalClassNames };

export type DialogModalProps = ComponentProps<typeof Dialog> & {
  modalRef?: undefined | React.RefObject<null | React.ComponentRef<typeof ModalProvider>>,
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** How to display the modal in the viewport. Default: 'center'. */
  display?: undefined | 'center' | 'full-screen' | 'slide-over',
  
  /** If `display` is `slide-over`, from which side the modal should originate. */
  slideOverPosition?: undefined | 'left' | 'right',
  
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
export const DialogModal = Object.assign(
  (props: DialogModalProps) => {
    const {
      children,
      modalRef,
      trigger,
      unstyled = false,
      display = 'center',
      slideOverPosition = 'right',
      size = 'medium',
      ...propsRest
    } = props;
    
    return (
      <ModalProvider
        ref={modalRef}
        content={({ close, dialogProps }) =>
          <Dialog
            flat={['full-screen', 'slide-over'].includes(display)}
            {...dialogProps}
            showCloseIcon
            autoFocusClose
            onRequestClose={close}
            {...propsRest}
            className={cx(
              'bk',
              { [cl['bk-dialog-modal']]: !unstyled },
              { [cl['bk-dialog-modal--center']]: display === 'center' },
              { [cl['bk-dialog-modal--full-screen']]: display === 'full-screen' },
              { [cl['bk-dialog-modal--slide-over']]: display === 'slide-over' },
              { [cl['bk-dialog-modal--slide-over--left']]: slideOverPosition === 'left' },
              { [cl['bk-dialog-modal--slide-over--right']]: slideOverPosition === 'right' },
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
  },
  {
    Action: Dialog.Action,
    ActionIcon: Dialog.ActionIcon,
    CancelAction: Dialog.CancelAction,
    SubmitAction: Dialog.SubmitAction,
  },
);
