/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { flushSync } from 'react-dom';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx } from '../../../util/componentUtil.ts';

import { Dialog } from '../../containers/Dialog/Dialog.tsx';
import { type PopoverProviderProps, PopoverProvider } from '../../util/overlays/popover/PopoverProvider.tsx';

import cl from './DialogOverlay.module.scss';


export { cl as DialogOverlayClassNames };

type PopoverProviderPropsDialog = PopoverProviderProps<HTMLDialogElement>;

export type DialogOverlayProps = Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  /** Content of the overlay. If a function, will be passed a dialog controller. */
  children?: React.ReactNode | PopoverProviderPropsDialog['popover'],
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the overlay should be active by default. Default: false. */
  activeDefault?: undefined | boolean,
  
  /** How to display the overlay in the viewport. Default: 'slide-over'. */
  display?: undefined | 'slide-over',
  
  /** If `display` is `slide-over`, from which side the overlay should originate. */
  slideOverPosition?: undefined | 'left' | 'right',
  
  /** The size of the overlay. */
  size?: undefined | 'small' | 'medium' | 'large',
  
  /**
   * A overlay trigger to render. Will be passed an `activate` callback to open the overlay. Optional, if not specified
   * you can manually trigger the overlay through `popoverRef` instead.
   */
  trigger?: undefined | PopoverProviderPropsDialog['children'],
  
  /** Whether to allow users to close the dialog manually. */
  allowUserClose?: undefined | boolean,
  
  /** A reference to the popover, for imperative control. */
  popoverRef?: undefined | React.Ref<React.ComponentRef<typeof PopoverProvider>>,
  
  /** Any additional props to pass to the popover provider. */
  providerProps?: undefined | Omit<PopoverProviderPropsDialog, 'children'>,
};

export type OverlayWithSubject<S> = {
  props: Partial<DialogOverlayProps>,
  subject: undefined | S,
  activateWith: (subject: S | (() => S)) => void,
};
/**
 * Utility hook to get a reference to a `DialogOverlay` for imperative usage. To open, you can call `activate()`, or
 * `activateWith()` if you want to include some subject data to be shown in the modal.
 */
export const useOverlayWithSubject = <S,>(
  config?: undefined | {
    subjectInitial?: undefined | S | (() => undefined | S),
  },
): OverlayWithSubject<S> => {
  const { subjectInitial } = config ?? {};
  
  const popoverRef = PopoverProvider.useRef(null);
  const [subject, setSubject] = React.useState<undefined | S>(subjectInitial);
  
  return {
    props: { popoverRef },
    subject,
    activateWith: (subject: S | (() => S)) => {
      // Use flushSync() to force the modal to render, in case the modal rendering is conditional
      // on the subject being set.
      flushSync(() => { setSubject(subject); });
      
      popoverRef.current?.activate();
    },
  };
};

/**
 * A dialog component displayed as a popover when activating the given trigger.
 */
export const DialogOverlay = Object.assign(
  (props: DialogOverlayProps) => {
    const {
      children,
      unstyled = false,
      activeDefault = false,
      display = 'slide-over',
      slideOverPosition = 'right',
      size = 'medium',
      trigger = () => null,
      allowUserClose = true,
      popoverRef,
      providerProps,
      ...propsRest
    } = props;
    
    return (
      <PopoverProvider<HTMLDialogElement>
        activeDefault={activeDefault}
        popover={popoverController =>
          <Dialog
            open={false} // Make sure `open` is not set to avoid https://issues.chromium.org/issues/388538944
            flat={['slide-over'].includes(display)}
            {...popoverController.popoverProps}
            showCloseIcon={allowUserClose}
            autoFocusClose={allowUserClose}
            showCancelAction={allowUserClose}
            onRequestClose={popoverController.close}
            {...propsRest}
            className={cx(
              'bk',
              { [cl['bk-dialog-overlay']]: !unstyled },
              { [cl['bk-dialog-overlay--slide-over']]: display === 'slide-over' },
              { [cl['bk-dialog-overlay--slide-over--left']]: display === 'slide-over' && slideOverPosition === 'left' },
              { [cl['bk-dialog-overlay--slide-over--right']]: display === 'slide-over' && slideOverPosition === 'right' },
              { [cl['bk-dialog-overlay--small']]: size === 'small' },
              { [cl['bk-dialog-overlay--medium']]: size === 'medium' },
              { [cl['bk-dialog-overlay--large']]: size === 'large' },
              popoverController.popoverProps.className,
              propsRest.className,
            )}
          >
            {typeof children === 'function' ? children(popoverController) : children}
          </Dialog>
        }
        {...providerProps}
        ref={mergeRefs(popoverRef, providerProps?.ref)}
      >
        {trigger}
      </PopoverProvider>
    );
  },
  {
    usePopoverRef: PopoverProvider.useRef,
    useOverlayWithSubject,
    Action: Dialog.Action,
    ActionIcon: Dialog.ActionIcon,
    CancelAction: Dialog.CancelAction,
    SubmitAction: Dialog.SubmitAction,
  },
);
