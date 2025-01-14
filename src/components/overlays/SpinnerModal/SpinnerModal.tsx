/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { Spinner } from '../../graphics/Spinner/Spinner.tsx';
import { type ModalProviderProps, ModalProvider } from '../ModalProvider/ModalProvider.tsx';

import cl from './SpinnerModal.module.scss';


export { cl as SpinnerModalClassNames };

export type SpinnerModalProps = React.PropsWithChildren<ComponentProps<typeof Spinner> & {
  /** A reference to the modal, for imperative control. */
  modalRef?: undefined | React.Ref<React.ComponentRef<typeof ModalProvider>>,
  
  /** Any additional props to pass to the modal provider. */
  providerProps?: undefined | Omit<ModalProviderProps, 'children'>,
  
  /** Delay until the spinner is visible. Useful to prevent flashing for short actions. Default: 1 second. */
  delay?: undefined | number,
}>;
/**
 * A loading spinner displayed as modal.
 */
export const SpinnerModal = (props: SpinnerModalProps) => {
  const { modalRef, providerProps, delay = 1000, ...propsRest } = props;
  
  const [visible, setVisible] = React.useState(delay === 0);
  
  useEffectOnce(() => {
    if (delay === 0) { return; }
    globalThis.setTimeout(() => { setVisible(true); }, delay);
  });
  
  return (
    <ModalProvider
      active={visible}
      onActiveChange={setVisible}
      allowUserClose={false}
      unmountDelay={0} // No exit animation, once done we want the spinner away as fast as possible
      dialog={({ dialogProps }) =>
        <dialog {...dialogProps} inert aria-modal="true">
          <Spinner
            size="large"
            {...propsRest}
            className={cx(
              cl['bk-spinner-modal'],
              propsRest.className,
            )}
          />
        </dialog>
      }
      {...providerProps}
      ref={mergeRefs(modalRef, providerProps?.ref)}
    />
  );
};
