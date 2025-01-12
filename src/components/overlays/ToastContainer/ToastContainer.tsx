/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { useActiveModalDialog } from '../../util/overlays/modal/ModalDialogProvider.tsx';

import { Banner } from '../../containers/Banner/Banner.tsx';

import cl from './ToastContainer.module.scss';


export { cl as ToastContainerClassNames };

type ToastNotification = { id: number, title: string, message: React.ReactNode };
const toasts: Array<ToastNotification> = [
  { id: 1, title: 'Toast 1', message: 'Hello' },
  { id: 2, title: 'Toast 2', message: 'Hello' },
];

export const Toast = (props: React.ComponentProps<typeof Banner>) => {
  return (
    <Banner
      compact={false}
      {...props}
      className={cx(cl['bk-toast'], props.className)}
    />
  )
};

export type ToastContainerProps = React.PropsWithChildren<ComponentProps<'section'> & {
}>;
/**
 * Renders any current toast notifications.
 */
export const ToastContainer = (props: ToastContainerProps) => {
  const { ...propsRest } = props;
  
  const containerRef = React.useRef<React.ComponentRef<'section'>>(null);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) { return; }
    
    if (!container.matches(`:popover-open`)) {
      container.showPopover();
    }
  }, []);
  
  return (
    <section
      aria-label="Notifications"
      tabIndex={-1} // Do not include in normal tab order
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      popover="manual"
      {...propsRest}
      ref={mergeRefs(propsRest.ref, containerRef)}
      className={cx(
        'bk',
        cl['bk-toast-container'],
        propsRest.className,
      )}
    >
      {toasts.map(toast =>
        <Toast
          key={toast.id}
          className={cl['bk-toast--skip-entry']}
          variant="success"
          title={toast.title}
        >
          {toast.message}
        </Toast>
      )}
    </section>
  );
};



export const ToastProvider = (props: React.PropsWithChildren) => {
  const activeModalDialog = useActiveModalDialog();
  // const containerRef: React.RefCallback<HTMLElement> = (element) => {
  //   if (element) {
  //     element.showPopover();
  //   }
  // };
  
  // FIXME: memoize to prevent excessive rerendering
  return (
    <>
      {props.children}
      {createPortal(<ToastContainer/>, activeModalDialog ?? window.document.body)}
    </>
  )
};
