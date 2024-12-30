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

/*
const useClickOutside = <E extends HTMLElement>(ref: React.RefObject<E>, callback: () => void) => {
  const handleEvent = React.useCallback((event: React.PointerEvent<E>) => {
    if (ref && ref.current) {
      if (ref.current.contains(event.target as Node)) {
        React.setState({ hasClickedOutside: false });
      } else {
        React.setState({ hasClickedOutside: true });
      }
    }
  }, [ref]);
  
  React.useEffect(() => {
    if (!window.PointerEvent) { return; }
    
    document.addEventListener('pointerdown', handleEvent);
    
    return () => {
      if (window.PointerEvent) {
        document.removeEventListener('pointerdown', handleEvent);
      } else {
        document.removeEventListener('mousedown', handleEvent);
        document.removeEventListener('touchstart', handleEvent);
      }
    }
  }, []);

  return [ref, hasClickedOutside];
};
*/


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
  /** Whether the component should include the default styling. Defaults to false. */
  unstyled?: undefined | boolean,
  
  /** If specified, a close action is displayed. Defines the action to perform on close. */
  onClose?: undefined | (() => void),
};
/**
 * The Dialog component displays an interaction with the user, for example a confirmation, or a form to be submitted.
 */
export const Dialog = (props: DialogProps) => {
  const {
    children,
    unstyled = false,
    onClose,
    ...propsRest
  } = props;
  
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const scroller = useScroller();
  
  const active = false; // FIXME
  
  /*
  // Sync the `active` flag with the DOM dialog
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    if (active && !dialog.open) {
      dialog.showDialog();
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);
  */
  
  // Sync the dialog close event with the `active` flag
  const handleCloseEvent = React.useCallback((event: Event): void => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    if (active && event.target === dialog) {
      onClose();
    }
  }, [active, onClose]);
  
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) { return; }
    
    dialog.addEventListener('close', handleCloseEvent);
    return () => { dialog.removeEventListener('close', handleCloseEvent); };
  }, [handleCloseEvent]);
  
  const close = React.useCallback(() => {
    onClose();
  }, [onClose]);
  
  const handleDialogClick = React.useCallback((event: React.MouseEvent<HTMLDialogElement>) => {
    propsRest.onClick?.(event);
    
    if (event.defaultPrevented) { return; }
    
    const dialog = dialogRef.current;
    if (dialog !== null && event.target === dialog) {
      // Note: clicking the backdrop just results in an event where the target is the `<dialog>` element. In order to
      // distinguish between the backdrop and the dialog content, we assume that the `<dialog>` is fully covered by
      // another element. In our case, `bk-dialog__content` must cover the whole `<dialog>` otherwise this will not
      // work.
      close();
    }
  }, [close, propsRest.onClick]);
  
  return (
    <dialog
      open
      {...scroller}
      {...propsRest}
      ref={mergeRefs(dialogRef, propsRest.ref)}
      className={cx(
        'bk',
        { [cl['bk-dialog']]: !unstyled },
        scroller.className,
        propsRest.className,
      )}
      onClick={handleDialogClick}
    >
      <header className={cx(cl['bk-dialog__header'])}>
        <H5>Title</H5>
        
        {typeof onClose === 'function' &&
          <ActionIcon
            label="Close dialog"
            tooltip={null}
            className={cx(cl['bk-dialog__action'], cl['bk-dialog__action-close'])}
            onPress={onClose}
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
