/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { type BannerVariant, Banner } from '../../containers/Banner/Banner.tsx';
import { TopLayerContext, useActiveModalDialog } from '../../util/overlays/TopLayerManager.tsx';

import { type ToastDescriptor, type ToastOptions, type ToastStorage, ToastStore } from './ToastStore.ts';

import cl from './ToastProvider.module.scss';


export { cl as ToasterClassNames };

export type { ToastDescriptor };

export const createToastNotifier = (toastStore: ToastStore) => {
  const notify = (toast: ToastDescriptor) => {
    const toastId = toastStore.uniqueId();
    toastStore.announceToast(toastId, toast);
  };
  const notifyVariant = (
    variant: BannerVariant,
    toast: string | Omit<ToastDescriptor, 'variant'>,
    options?: undefined | ToastOptions,
  ) => {
    const descriptor: ToastDescriptor = typeof toast === 'string'
      ? { variant, message: toast, options }
      : { ...toast, variant, options: { ...toast.options, ...(options ?? {}) } };
    notify(descriptor);
  };
  return Object.assign(notify, {
    info: (toast: string | Omit<ToastDescriptor, 'variant'>, options?: undefined | ToastOptions) =>
      notifyVariant('info', toast, options),
    warning: (toast: string | Omit<ToastDescriptor, 'variant'>, options?: undefined | ToastOptions) =>
      notifyVariant('warning', toast, options),
    error: (toast: string | Omit<ToastDescriptor, 'variant'>, options?: undefined | ToastOptions) =>
      notifyVariant('error', toast, options),
    success: (toast: string | Omit<ToastDescriptor, 'variant'>, options?: undefined | ToastOptions) =>
      notifyVariant('success', toast, options),
  });
};

export const Toast = (props: React.ComponentProps<typeof Banner>) => {
  return (
    <Banner
      trimmed
      compact={false}
      showCloseAction
      {...props}
      className={cx(cl['bk-toast'], props.className)}
    />
  )
};

export const ToastCopyAction = ({ toast }: { toast: ToastDescriptor }) => {
  const defaultLabel = 'Copy';
  const [label, setLabel] = React.useState(defaultLabel);
  
  const handleCopy = React.useCallback(async (message: string) => {
    try {
      // Idea: use `write()` with HTML mime type to copy arbitrary content? Could get the `innerHTML` through a ref.
      if (navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      }
      
      setLabel('Copied!');
    } catch (error: unknown) {
      setLabel('Error: unable to copy');
    }
  }, []);
  
  const message = toast.message;
  
  // Currently don't support copying unless the message is a string
  if (typeof message !== 'string') { return null; }
  
  return (
    <Banner.ActionIcon
      label={label}
      onPress={() => handleCopy(message)} // Note: careful to return the promise here to `onPress`
      onMouseLeave={() => {
        // Reset the label after exit animation had a chance to complete
        window.setTimeout(() => { setLabel(defaultLabel); }, 500);
      }}
    >
      <Icon icon="copy"/>
    </Banner.ActionIcon>
  );
};

export type ToasterProps = React.PropsWithChildren<ComponentProps<'section'>>;
/**
 * Renders any current toast notifications.
 */
export const Toaster = (props: ToasterProps) => {
  const { ...propsRest } = props;
  const { toastStore } = useToastContext();
  
  // Cache the toasts we read from the store.
  // Note: initialize function must read the toasts synchronously from the store, we cannot wait until the first
  // `subscribe()` kicks in, because then we spend one render cycle without state (which causes flickering).
  const [toasts, setToasts] = React.useState<ToastStorage>(() => toastStore.toasts());
  
  React.useEffect(() => {
    return toastStore.subscribe(toasts => {
      // FIXME: it would be nice to do this in a view transition so that things like toast shifting animates properly.
      // However view transitions cause some issues, e.g. click events don't fire while the transition is happening.
      //startViewTransition(() => {
        setToasts(toasts);
      //});
    });
  }, [toastStore]);
  
  // Pause auto-close when the page is not currently visible by the user
  React.useEffect(() => {
    const controller = new AbortController();
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        toastStore.onPageVisible();
      } else {
        toastStore.onPageHide();
      }
    }, { signal: controller.signal });
    
    return () => { controller.abort(); };
  }, [toastStore]);
  
  const containerRef = React.useRef<null | React.ComponentRef<'section'>>(null);
  const openPopover = React.useCallback((container: null | HTMLElement) => {
    if (container && container.isConnected) {
      try {
        container.hidePopover();
        container.showPopover();
      } catch (error: unknown) {
        console.error(`Failed to open Toaster`, error);
      }
    }
  }, []);
  
  // Ref callback to enforce that the Toaster is always rendered as a popover
  const enforcePopoverOpen: React.RefCallback<React.ComponentRef<'section'>> = container => {
    containerRef.current = container;
    openPopover(container);
  };
  
  const modalDialogContext = React.use(TopLayerContext);
  React.useEffect(() => {
    if (modalDialogContext === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    return modalDialogContext.modalDialogStack.subscribe(() => { openPopover(containerRef.current); });
  }, [modalDialogContext, openPopover]);
  
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
      {Object.entries(toasts).map(([toastKey, { metadata, descriptor: toast }]) => {
        const toastId = toastStore.idFromKey(toastKey);
        return (
          <Toast
            key={toastKey}
            className={cx({
              [cl['bk-toast--skip-entry']]: toastStore.shouldSkipEntryAnimation(toastId),
            })}
            variant={toast.variant}
            title={toast.title}
            hidden={metadata.dismissed}
            actions={
              <ToastCopyAction toast={toast}/>
            }
            onClose={() => {
              toastStore.dismissToast(toastId);
            }}
            // Handle dismiss signals (e.g. clicking or tapping on the toast)
            onClick={event => { event.stopPropagation(); toastStore.dismissToast(toastId); }}
            // Handle interest signals (e.g. hovering over the toast)
            onMouseEnter={event => { event.stopPropagation(); toastStore.pauseAutoClose(toastId); }}
            onTouchStart={event => { event.stopPropagation(); toastStore.pauseAutoClose(toastId); }}
            onMouseLeave={event => { event.stopPropagation(); toastStore.resumeAutoClose(toastId); }}
            onTouchEnd={event => { event.stopPropagation(); toastStore.resumeAutoClose(toastId); }}
          >
            {toast.message}
          </Toast>
        );
      })}
    </section>
  );
};


export type ToastContext = { toastStore: ToastStore, notify: (toast: ToastDescriptor) => void };
export const ToastContext = React.createContext<null | ToastContext>(null);
export const useToastContext = (): ToastContext => {
  const context = React.use(ToastContext);
  if (context === null) { throw new Error(`Missing ToastContext`); }
  return context;
};

// A single global instance, to be used with `<ToastProvider global/>`
export const globalToastStore = new ToastStore();
export const notify = createToastNotifier(globalToastStore);

type ToastProviderProps = React.PropsWithChildren<{ global?: boolean }>;
export const ToastProvider = ({ global = false, children }: ToastProviderProps) => {
  const activeModalDialog = useActiveModalDialog();
  
  // Note: we need to be careful to not store toasts in `useState()` in this component, otherwise the entire
  // subtree will be rerendered on every change. Use the Observable pattern instead.
  // https://www.fullstory.com/blog/why-fullstory-uses-observables-in-react
  
  const toastStoreRef = React.useRef<null | ToastStore>(global ? globalToastStore : null);
  const toastStore = toastStoreRef.current ?? new ToastStore(); // Lazy initialization
  
  const toastContext = React.useMemo(() => ({
    toastStore,
    notify: createToastNotifier(toastStore),
  }), [toastStore]);
  
  return (
    <ToastContext value={toastContext}>
      {children}
      {/*
      Render the toasts in the top-most modal `<dialog>`, to work around browser limitations where only the `<dialog>`
      element and its descendents are interactive (everything else is inert).
      */}
      {createPortal(<Toaster/>, activeModalDialog?.dialogRef?.current ?? window.document.body)}
    </ToastContext>
  );
};

export const useNotify = () => {
  return useToastContext().notify;
};
