/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../../util/reactUtil.ts';


export type ModalDialogReference = {
  id: string,
  dialogRef: React.RefObject<null | HTMLDialogElement>,
};

export type ModalDialogContext = {
  activeModal: null | HTMLDialogElement,
  activate: (ref: ModalDialogReference) => void,
  deactivate: (ref: ModalDialogReference) => void,
};
export const ModalDialogContext = React.createContext<null | ModalDialogContext>(null);

/**
 * A context provider
 */
export const ModalDialogProvider = (props: React.PropsWithChildren) => {
  const [instances, setInstances] = React.useState<Array<ModalDialogReference>>([]);
  
  const context = React.useMemo<ModalDialogContext>(() => ({
    activeModal: instances.at(-1)?.dialogRef.current ?? null,
    activate: (ref: ModalDialogReference) => {
      setInstances(instances => [...instances.filter(inst => inst.id !== ref.id), ref]);
    },
    deactivate: (ref: ModalDialogReference) => {
      setInstances(instances => instances.filter(inst => inst.id !== ref.id));
    },
  }), [instances]);
  
  // FIXME: this is potentially very inefficient due to React context leading to frequent rerendering.
  // Should we do this through a subscription service instead? (So not integrated into React's rendering process.)
  return (
    <ModalDialogContext value={context}>
      {props.children}
    </ModalDialogContext>
  );
};

export const useModalDialogContext = (active: boolean, dialogRef: React.RefObject<null | HTMLDialogElement>) => {
  const context = React.use(ModalDialogContext);
  
  const id = React.useId();
  const ref = React.useMemo(() => ({ id, dialogRef }), [id, dialogRef]);
  
  // When `active` changes, sync up with the context
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    if (active) {
      context.activate(ref);
    } else {
      context.deactivate(ref);
    }
  }, [context, active, ref]);
  
  // On unmount, deactivate
  useEffectOnce(() => {
    if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
    return () => context.deactivate(ref);
  });  
};

export const useActiveModalDialog = (): null | HTMLDialogElement => {
  const context = React.use(ModalDialogContext);
  if (context === null) { throw new Error(`Cannot read ModalDialogContext: missing provider.`); }
  
  return context.activeModal;
};
