/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';

import { type IconName, type IconProps, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { H5 } from '../../../typography/Heading/Heading.tsx';
import { TooltipProvider } from '../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './Dialog.module.scss';


export { cl as DialogClassNames };

export type ActionIconProps = ComponentProps<typeof Button> & {
  /** There must be `label` on an icon-only button, for accessibility. */
  label: Required<ComponentProps<typeof Button>>['label'],
  
  /** Optional custom tooltip text, if different from `label`. */
  tooltip?: undefined | ComponentProps<typeof TooltipProvider>['tooltip'],
};
/**
 * An action that is rendered as just an icon.
 */
export const ActionIcon = ({ tooltip, ...buttonProps }: ActionIconProps) => {
  return (
    <TooltipProvider compact tooltip={typeof tooltip !== 'undefined' ? tooltip : buttonProps.label}>
      <Button unstyled
        {...buttonProps}
        className={cx(cl['bk-dialog__action'], cl['bk-dialog__action--icon'], buttonProps.className)}
      />
    </TooltipProvider>
  );
};

export type DialogProps = Omit<ComponentProps<'dialog'>, 'title'> & {
  /** Whether the component should include the default styling. Default: false. */
  unstyled?: undefined | boolean,
  
  /** Whether the dialog should be displayed as a flat panel (no shadows/borders/rounding). Default: false. */
  flat?: undefined | boolean,
  
  /** The title of the dialog, to be displayed in the dialog header. */
  title: React.ReactNode,
  
  /** If specified, a close action is displayed. Default: true. */
  showCloseAction?: undefined | boolean,
  
  /** Callback that is called when the user requests the dialog to close. */
  onRequestClose?: undefined | (() => void), // Note: cannot name this `onClose`, dialog already has an `onClose` prop
};
/**
 * The Dialog component displays an interaction with the user, for example a confirmation, or a form to be submitted.
 */
export const Dialog = (props: DialogProps) => {
  const {
    children,
    unstyled = false,
    flat = false,
    title,
    showCloseAction = true,
    onRequestClose,
    ...propsRest
  } = props;
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const scrollerProps = useScroller();
  
  if (showCloseAction && typeof onRequestClose !== 'function') {
    console.error(`Missing prop in <Dialog/>: 'onRequestClose' function`);
  }
  
  return (
    <dialog
      open
      {...scrollerProps}
      {...propsRest}
      ref={mergeRefs(dialogRef, propsRest.ref)}
      className={cx(
        'bk',
        { [cl['bk-dialog']]: !unstyled },
        { [cl['bk-dialog--flat']]: flat },
        scrollerProps.className,
        propsRest.className,
      )}
    >
      <header className={cx(cl['bk-dialog__header'])}>
        <H5>{title}</H5>
        
        {showCloseAction &&
          <ActionIcon
            label="Close dialog"
            tooltip={null}
            className={cx(cl['bk-dialog__action'], cl['bk-dialog__action-close'])}
            onPress={onRequestClose}
          >
            <Icon icon="cross"/>
          </ActionIcon>
        }
      </header>
      
      <section className={cx(cl['bk-dialog__content'], 'bk-body-text')}>
        {children}
      </section>
      
      {/* <footer className={cx(cl['bk-dialog__actions'])}>
        <Button autoFocus variant="secondary" label="Cancel"/>
        <Button variant="primary" label="Submit"/>
      </footer> */}
    </dialog>
  );
};
