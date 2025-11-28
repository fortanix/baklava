/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';

import { Button } from '../../actions/Button/Button.tsx';
import { IconButton } from '../../actions/IconButton/IconButton.tsx';
import { H5 } from '../../../typography/Heading/Heading.tsx';
import { TooltipProvider } from '../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './Dialog.module.scss';


export { cl as DialogClassNames };


export type DialogContext = {
  close: () => void,
};
export const DialogContext = React.createContext<null | DialogContext>(null);
export const useDialogContext = () => {
  const context = React.use(DialogContext);
  if (context === null) { throw new Error(`Cannot read DialogContext: missing provider.`); }
  return context;
};


type ActionProps = React.ComponentProps<typeof Button> & {
  /** Optional tooltip text. */
  tooltip?: undefined | ComponentProps<typeof TooltipProvider>['tooltip'],
};
/**
 * An action button to be displayed in the dialog footer.
 */
const Action = ({ tooltip = null, ...buttonProps }: ActionProps) => {
  return (
    <TooltipProvider compact tooltip={typeof tooltip !== 'undefined' ? tooltip : null}>
      <Button
        {...buttonProps}
        className={cx(cl['bk-dialog__action'], buttonProps.className)}
      />
    </TooltipProvider>
  );
};

type ActionIconProps = React.ComponentProps<typeof IconButton> & {
  /** Optional tooltip text. */
  tooltip?: undefined | ComponentProps<typeof TooltipProvider>['tooltip'],
};
/**
 * An action that is rendered as just an icon.
 */
const ActionIcon = ({ tooltip, ...iconButtonProps }: ActionIconProps) => {
  return (
    <TooltipProvider compact tooltip={typeof tooltip !== 'undefined' ? tooltip : iconButtonProps.label}>
      <IconButton
        {...iconButtonProps}
        className={cx(cl['bk-dialog__action--icon'], iconButtonProps.className)}
      />
    </TooltipProvider>
  );
};

const CancelAction = (props: ActionProps) => {
  const context = useDialogContext();
  const handlePress = () => { props.onPress?.(); context.close(); };
  return <Action kind="secondary" label="Cancel" {...props} onPress={handlePress}/>;
};
const SubmitAction = (props: ActionProps) => {
  const context = useDialogContext();
  const handlePress = () => { props.onPress?.(); context.close(); };
  return <Action kind="primary" label="Submit" {...props} onPress={handlePress}/>;
};

export type DialogProps = Omit<ComponentProps<'dialog'>, 'title'> & {
  /** Whether this component should be unstyled. Default: false. */
  unstyled?: undefined | boolean,
  
  /** Whether the dialog should be displayed as a flat panel (no shadows/borders/rounding). Default: false. */
  flat?: undefined | boolean,
  
  /** The title of the dialog, to be displayed in the dialog header. */
  title: React.ReactNode,
    
  /** If specified, a close icon is displayed in the header. Default: true. */
  showCloseIcon?: undefined | boolean,
  
  /** If specified, a close action is displayed in the footer. Default: true. */
  showCancelAction?: undefined | boolean,

  /** Callback that is called when the user requests the dialog to close. */
  onRequestClose?: undefined | (() => void), // Note: cannot name this `onClose`, dialog already has an `onClose` prop
  
  /** Any additional actions to be shown in the dialog. */
  actions?: undefined | React.ReactNode,
  
  /** Whether to set autofocus on the close button. Default: false. */
  autoFocusClose?: undefined | boolean,
  
  /** Container intended to display an icon on the top left corner, insetting the content and the action buttons. For larger elements, consider using DialogLayout */
  iconAside?: undefined | React.ReactNode,
};
/**
 * The Dialog component displays an interaction with the user, for example a confirmation, or a form to be submitted.
 */
export const Dialog = Object.assign(
  (props: DialogProps) => {
    const {
      children,
      unstyled = false,
      flat = false,
      title,
      showCloseIcon = true,
      showCancelAction = true,
      onClose,
      onRequestClose,
      actions,
      autoFocusClose = false,
      iconAside,
      ...propsRest
    } = props;
    
    const dialogId = React.useId();
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const scrollerProps = useScroller(); // FIXME: add `{ hasFocusableChild: true }`?
    
    if ((showCloseIcon || showCancelAction) && typeof onRequestClose !== 'function') {
      console.error(`Missing prop in <Dialog/>: 'onRequestClose' function`);
    }
    
    const dialogContext = React.useMemo<DialogContext>(() => ({
      close: onRequestClose ?? (() => { console.warn('Missing `onRequestClose` callback.'); })
    }), [onRequestClose]);
    
    const handleClose = React.useCallback((event: React.SyntheticEvent<HTMLDialogElement>) => {
      // Workaround for a bug in React where the close event will bubble up to parent components, even though native
      // close events do not bubble.
      event.stopPropagation();
      onClose?.(event);
    }, [onClose]);
    
    return (
      <DialogContext value={dialogContext}>
        <dialog
          open
          //role="dialog" // Default role. Change this to `role="alertdialog"` for things like confirmation modals.
          aria-labelledby={`${dialogId}-title`}
          aria-describedby={`${dialogId}-content`}
          {...scrollerProps}
          {...propsRest}
          ref={mergeRefs(dialogRef, propsRest.ref)}
          className={cx(
            'bk',
            { [cl['bk-dialog']]: !unstyled },
            { [cl['bk-dialog--flat']]: flat },
            { [cl['bk-dialog--icon-aside']]: iconAside },
            scrollerProps.className,
            propsRest.className,
          )}
          onClose={handleClose}
        >
          <header className={cx(cl['bk-dialog__header'])}>
            <H5 id={`${dialogId}-title`} className={cx(cl['bk-dialog__header__title'])}>{title}</H5>
            
            <div className={cx(cl['bk-dialog__header__actions'])}>
              {showCloseIcon &&
                <ActionIcon
                  icon="cross"
                  autoFocus={autoFocusClose}
                  label="Close dialog"
                  tooltip={null}
                  className={cx(cl['bk-dialog__header-action-close'])}
                  onPress={onRequestClose}
                />
              }
            </div>
          </header>
          
          <div className={cl['bk-dialog__content']}>
            {iconAside && (
              <aside className={cx(cl['bk-dialog__content__icon-aside'])}>
                {iconAside}
              </aside>
            )}
            <section
              id={`${dialogId}-content`} // Used with `aria-describedby`
              role="document" // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/document_role
              // FIXME: make this focusable instead of the <dialog> as per guidelines on MDN?
              //tabIndex={0}
              className={cx(cl['bk-dialog__content__body'], 'bk-prose')}
            >
              {children}
            </section>
          </div>
          
          
          {(showCancelAction || actions) &&
            <footer className={cx(cl['bk-dialog__actions'])}>
              {showCancelAction && <CancelAction/>}
              {actions}
            </footer>
          }
        </dialog>
      </DialogContext>
    );
  },
  {
    Action,
    ActionIcon,
    CancelAction,
    SubmitAction,
  },
);
