/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type ModalReference = {
  id: string,
  dialogRef: React.RefObject<null | HTMLDialogElement>,
};

export type ModalContext = {
  activeModal: null | HTMLDialogElement,
  activate: (ref: ModalReference) => void,
  deactivate: (ref: ModalReference) => void,
};
export const ModalContext = React.createContext<null | ModalContext>(null);

export const ModelProvider = (props: React.PropsWithChildren) => {
  const [instances, setInstances] = React.useState<Array<ModalReference>>([]);
  
  const context = React.useMemo<ModalContext>(() => ({
    activeModal: instances.at(-1)?.dialogRef.current ?? null,
    activate: (ref: ModalReference) => {
      setInstances(instances => [...instances.filter(inst => inst.id !== ref.id), ref]);
    },
    deactivate: (ref: ModalReference) => {
      setInstances(instances => instances.filter(inst => inst.id !== ref.id));
    },
  }), [instances]);
  
  return (
    <ModalContext value={context}>
      {props.children}
    </ModalContext>
  );
};

export const useModalContext = (active: boolean, dialogRef: React.RefObject<null | HTMLDialogElement>) => {
  const context = React.use(ModalContext);
  
  const id = React.useId();
  const ref = { id, dialogRef };
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: want to run only on mount/unmount
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalContext: missing provider.`); }
    return () => context.deactivate(ref);
  }, []);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: want to run only on mount/unmount
  React.useEffect(() => {
    if (context === null) { throw new Error(`Cannot read ModalContext: missing provider.`); }
    if (active) {
      context.activate(ref);
    } else {
      context.deactivate(ref);
    }
  }, [active]);
};

export const useActiveModal = (): null | HTMLDialogElement => {
  const context = React.use(ModalContext);
  if (context === null) { throw new Error(`Cannot read ModalContext: missing provider.`); }
  
  return context.activeModal;
};
