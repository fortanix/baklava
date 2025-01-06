/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { NonUndefined } from '../../../util/types.ts';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx } from '../../../util/componentUtil.ts';

import { Dialog } from '../../containers/Dialog/Dialog.tsx';
import { ModalProvider, type ModalProviderProps } from '../ModalProvider/ModalProvider.tsx';

import cl from './DialogModal.module.scss';


export { cl as DialogModalClassNames };

export type DialogModalProps = Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  /** Content of the modal. If a function, will be passed a dialog controller. */
  children?: React.ReactNode | ModalProviderProps['dialog'],
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the modal should be active by default. Default: false. */
  activeDefault?: undefined | boolean,
  
  /** How to display the modal in the viewport. Default: 'center'. */
  display?: undefined | 'center' | 'full-screen' | 'slide-over',
  
  /** If `display` is `slide-over`, from which side the modal should originate. */
  slideOverPosition?: undefined | 'left' | 'right',
  
  /** The size of the modal. Note: does not apply to full screen modals. */
  size?: undefined | 'small' | 'medium' | 'large',
  
  /**
   * A modal trigger to render. Will be passed an `activate` callback to open the modal. Optional, if not specified
   * you can manually trigger the modal through `modalRef` instead.
   */
  trigger?: undefined | ModalProviderProps['children'],
  
  /** Whether to allow users to close the dialog manually. */
  allowUserClose?: undefined | boolean,
  
  /** A reference to the modal, for imperative control. */
  modalRef?: undefined | React.Ref<React.ComponentRef<typeof ModalProvider>>,
  
  /** Any additional props to pass to the modal provider. */
  providerProps?: undefined | Omit<ModalProviderProps, 'children'>,
};

export type ModalWithSubject<S> = {
  props: Partial<DialogModalProps>,
  subject: undefined | S,
  activateWith: (subject: S | (() => S)) => void,
};
/**
 * Utility hook to get a reference to a `DialogModal` for imperative usage. To open, you can call `activate()`, or
 * `activateWith()` if you want to include some subject data to be shown in the modal.
 */
export const useModalWithSubject = <S,>(
  config?: undefined | {
    subjectInitial?: undefined | S | (() => undefined | S),
  },
): ModalWithSubject<S> => {
  const { subjectInitial } = config ?? {};
  
  const modalRef = ModalProvider.useRef(null);
  const [subject, setSubject] = React.useState<undefined | S>(subjectInitial);
  
  return {
    props: { modalRef },
    subject,
    activateWith: (subject: S | (() => S)) => {
      // Use flushSync() to force the modal to render, in case the modal rendering is conditional
      // on the subject being set.
      flushSync(() => { setSubject(subject); });
      
      modalRef.current?.activate();
    },
  };
};

/**
 * Similar to `useModalWithSubject`, but will be preconfigured for usage as a confirmation modal.
 */
export const useConfirmationModal = <S,>(
  config: {
    subjectInitial?: undefined | S | (() => undefined | S),
    actionLabel?: undefined | string,
    onConfirm: (subject: NonUndefined<S>) => void,
    onCancel?: undefined | ((subject: NonUndefined<S>) => void)
  },
) => {
  const { subjectInitial, actionLabel, onConfirm, onCancel } = config;
  const modal = useModalWithSubject({ subjectInitial });
  return {
    ...modal,
    props: {
      ...modal.props,
      // A confirmation modal must use the `role="alertdialog"` rather than the default `role="dialog"`.
      // See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alertdialog_role
      role: 'alertdialog',
      display: 'center' as const,
      size: 'small' as const,
      allowUserClose: false, // Force the user to explicitly select an action
      title: 'Confirm',
      children: 'Are you sure you want to perform this action?',
      actions: (
        <>
          <Dialog.CancelAction label="Cancel"
            onPress={() => {
              const subject = modal.subject;
              if (typeof subject === 'undefined') {
                console.error(`Unexpected: missing subject in confirmation`);
                return;
              }
              onCancel?.(subject);
            }}
          />
          <Dialog.SubmitAction label={actionLabel || 'Confirm'}
            onPress={() => {
              const subject = modal.subject;
              if (typeof subject === 'undefined') {
                console.error(`Unexpected: missing subject in confirmation`);
                return;
              }
              onConfirm(subject);
            }}
          />
        </>
      ),
    },
  };
};

/**
 * A dialog component displayed as a modal when activating the given trigger.
 */
export const DialogModal = Object.assign(
  (props: DialogModalProps) => {
    const {
      children,
      unstyled = false,
      activeDefault = false,
      display = 'center',
      slideOverPosition = 'right',
      size = 'medium',
      trigger = () => null,
      allowUserClose = true,
      modalRef,
      providerProps,
      ...propsRest
    } = props;
    
    return (
      <ModalProvider
        activeDefault={activeDefault}
        allowUserClose={allowUserClose}
        shouldCloseOnBackdropClick={display !== 'full-screen'}
        dialog={dialogController =>
          <Dialog
            aria-modal="true"
            flat={['slide-over'].includes(display)}
            {...dialogController.dialogProps}
            showCloseIcon={allowUserClose}
            autoFocusClose={allowUserClose}
            showCancelAction={allowUserClose}
            onRequestClose={dialogController.close}
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
              dialogController.dialogProps.className,
              propsRest.className,
            )}
          >
            {typeof children === 'function' ? children(dialogController) : children}
          </Dialog>
        }
        {...providerProps}
        ref={mergeRefs(modalRef, providerProps?.ref)}
      >
        {trigger}
      </ModalProvider>
    );
  },
  {
    useModalRef: ModalProvider.useRef,
    useModalWithSubject,
    useConfirmationModal,
    Action: Dialog.Action,
    ActionIcon: Dialog.ActionIcon,
    CancelAction: Dialog.CancelAction,
    SubmitAction: Dialog.SubmitAction,
  },
);
