/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { startViewTransition } from '../../../util/reactDomUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Banner } from '../../containers/Banner/Banner.tsx';
import { useActiveModalDialog } from '../../util/overlays/modal/ModalDialogProvider.tsx';

import { type ToastDescriptor, type ToastStorage, ToastsObservable } from './ToastStorage.ts';

import cl from './ToastProvider.module.scss';


export { cl as ToasterClassNames };

export const createToastNotifier = (toastsObservable: ToastsObservable) => (toast: ToastDescriptor) => {
  const toastId = toastsObservable.uniqueId();
  toastsObservable.announceToast(toastId, toast);
};

export const Toast = (props: React.ComponentProps<typeof Banner>) => {
  return (
    <Banner
      trimmed
      compact={false}
      {...props}
      className={cx(cl['bk-toast'], props.className)}
    />
  )
};

export type ToasterProps = React.PropsWithChildren<ComponentProps<'section'>>;
/**
 * Renders any current toast notifications.
 */
export const Toaster = (props: ToasterProps) => {
  const { ...propsRest } = props;
  const { toastsObservable } = useToastContext();
  
  // Cache the toasts we read from the observable
  const [toasts, setToasts] = React.useState<ToastStorage>(() => toastsObservable.toasts());
  React.useEffect(() => {
    return toastsObservable.subscribe(toasts => {
      // XXX View transitions cause some issues, e.g. click events don't fire while the transition is happening
      //startViewTransition(() => {
        setToasts(toasts);
      //});
    });
  }, [toastsObservable]);
  
  // Ref callback to enforce that the Toaster is always rendered as a popover
  const enforcePopoverOpen: React.RefCallback<React.ComponentRef<'section'>> = container => {
    if (container && container.isConnected && !container.matches(`:popover-open`)) {
      try {
        container.showPopover();
      } catch (error: unknown) {
        console.error(`Failed to open Toaster`, error);
      }
    }
  };
  
  return (
    <section
      aria-label="Notifications"
      tabIndex={-1} // Do not include in normal tab order
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      popover="manual"
      {...propsRest}
      ref={mergeRefs(enforcePopoverOpen, propsRest.ref)}
      className={cx(
        'bk',
        cl['bk-toaster'],
        propsRest.className,
      )}
    >
      {Object.entries(toasts).map(([toastKey, { metadata, descriptor: toast }]) =>
        <Toast
          key={toastKey}
          className={cx({
            [cl['bk-toast--skip-entry']]: metadata.entryAnimationFinished,
          })}
          variant={toast.variant}
          title={toast.title}
          hidden={metadata.dismissed}
          onClick={event => {
            event.stopPropagation();
            toastsObservable.dismissToast(toastsObservable.idFromKey(toastKey));
          }}
        >
          {toast.message}
        </Toast>
      )}
    </section>
  );
};


export type ToastContext = { toastsObservable: ToastsObservable, notify: (toast: ToastDescriptor) => void };
export const ToastContext = React.createContext<null | ToastContext>(null);
export const useToastContext = (): ToastContext => {
  const context = React.use(ToastContext);
  if (context === null) { throw new Error(`Missing ToastContext`); }
  return context;
};

// A single global instance, to be used with `<ToastProvider global/>`
export const globalToastsObservable = new ToastsObservable();
export const notify = createToastNotifier(globalToastsObservable);
Object.assign(window, { notify }); // TEMP

type ToastProviderProps = React.PropsWithChildren<{ global?: boolean }>;
export const ToastProvider = ({ global = false, children }: ToastProviderProps) => {
  const activeModalDialog = useActiveModalDialog();
  
  const toastsObservableRef = React.useRef<null | ToastsObservable>(global ? globalToastsObservable : null);
  const toastsObservable = toastsObservableRef.current ?? new ToastsObservable(); // Lazy initialization
  
  const toastContext = React.useMemo(() => ({
    toastsObservable,
    notify: createToastNotifier(toastsObservable),
  }), [toastsObservable]);
  
  return (
    <ToastContext value={toastContext}>
      {children}
      {createPortal(<Toaster/>, activeModalDialog ?? window.document.body)}
    </ToastContext>
  )
};

export const useNotify = () => {
  return useToastContext().notify;
};
