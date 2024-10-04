/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';
import { createPortal } from 'react-dom';

import cl from './Form.module.scss';


export { cl as FormClassNames };


export type FormContext = {
  formId: string,
};
export const FormContext = React.createContext<null | FormContext>(null);
export const useFormContext = (): FormContext => {
  const formContext = React.use(FormContext);
  if (formContext === null) { throw new Error(`Missing FormContext provider`); }
  return formContext;
};


export type FormProps = React.PropsWithChildren<ComponentProps<'form'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether this form should be nestable (i.e. can contain other `<form>` elements). */
  nestable?: undefined | boolean,
}>;
/**
 * Top-level form wrapper component.
 */
export const Form = (props: FormProps) => {
  const { unstyled = false, nestable, children, className, ...propsRest } = props;
  
  const formId = React.useId();
  const [wrapperRef, setWrapperRef] = React.useState<null | React.ElementRef<'div'>>(null);
  
  // Memoize to keep a stable reference
  const context: FormContext = React.useMemo(() => ({ formId }), [formId]);
  
  const renderForm = ({ children }: { children: React.ReactNode }) => {
    return (
      <form
        // Use POST by default to prevent (potentially sensitive) parameters from being leaked through GET params.
        // Note: if `action` is a function, then React overrides `method` anyway (and React complains if it's set).
        method={typeof propsRest.action === 'function' ? undefined : 'post'}
        {...propsRest}
        id={formId} // Do not allow override of `id` (breaks functionality)
        onSubmit={(event) => {
          // We support client only at the moment, so we want to always prevent default browser form submit behavior.
          event.preventDefault();
          
          propsRest.onSubmit?.(event);
          
          React.startTransition(async () => {
            // Optionally, we can clear the form for uncontrolled components, like default browser behavior. See:
            // https://github.com/facebook/react/pull/29019
            // https://github.com/facebook/react/issues/29034
            //React.requestFormReset(event.target);
            
            if (typeof propsRest.action === 'function') {
              // Call the user-provided action
              const formData = new FormData(event.target as HTMLFormElement);
              await propsRest.action(formData);
            }
          });
        }}
        {...nestable
          ? { hidden: true }
          : {
            className: cx({
              bk: true,
              [cl['bk-form']]: !unstyled,
            }, className)
          }
        }
      >
        <FormContext.Provider value={context}>
          {children}
        </FormContext.Provider>
      </form>
    );
  };
  
  if (nestable) {
    return (
      <div
        ref={setWrapperRef}
        className={cx({
          bk: true,
          [cl['bk-form']]: !unstyled,
        }, className)}
      >
        {wrapperRef &&
          renderForm({ children: createPortal(children, wrapperRef) })
        }
      </div>
    );
  }
  
  return renderForm({ children });
};
