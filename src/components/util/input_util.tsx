/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

type BaseInputProps = React.ComponentProps<'input'>;

// We want props to be applied to the wrapper `<div>` by default, since most common props (e.g. ID, class name, event
// handlers like `onClick`) make sense on the outer element. We offer `inputProps` as a way to pass props to the inner
// `<input/>` element. However, additionally we allow the following input-specific props as a convenience.

// 
// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes
export const inputSpecificPropKeys = {
  accept: true,
  alt: true,
  autoCapitalize: true,
  autoComplete: true,
  autoFocus: true,
  capture: true,
  checked: true,
  defaultValue: true,
  disabled: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: true,
  formTarget: true,
  height: true,
  list: true,
  max: true,
  maxLength: true,
  min: true,
  minLength: true,
  multiple: true,
  name: true,
  pattern: true,
  placeholder: true,
  readOnly: true,
  required: true,
  size: true,
  src: true,
  step: true,
  type: true,
  value: true,
  width: true,
  
  // Form events
  onChange: true,
  onChangeCapture: true,
  onBeforeInput: true,
  onBeforeInputCapture: true,
  onInput: true,
  onInputCapture: true,
  onReset: true,
  onResetCapture: true,
  onSubmit: true,
  onSubmitCapture: true,
  onInvalid: true,
  onInvalidCapture: true,
  
  // Focus events
  // Note: do *not* include these as input-specific. The reason is because React uses the `focusin` and `focusout`
  // events for `onFocus` and `onBlur` respectively. Thus, focus/blur on the input will already be captures by the
  // parent.
  // See: https://github.com/facebook/react/pull/19186
  // onFocus: true,
  // onFocusCapture: true,
  // onBlur: true,
  // onBlurCapture: true,
} as const satisfies Partial<{ [key in keyof React.InputHTMLAttributes<HTMLInputElement>]: true }>;
export type InputSpecificPropKeys = keyof typeof inputSpecificPropKeys;

export type InputSpecificProps = Partial<Pick<BaseInputProps, keyof typeof inputSpecificPropKeys>>;


type ExtractedProps<P extends {}> = {
  containerProps: Omit<P, InputSpecificPropKeys>,
  inputProps: InputSpecificProps,
};
/** Split props into container-specific and input-specific. */
export const extractInputSpecificProps = <P extends {}>(props: P): ExtractedProps<P> => {
  const containerProps: Record<string, unknown> = { ...props };
  const inputProps: InputSpecificProps = {};
  
  for (const key of Object.keys(inputSpecificPropKeys)) {
    if (key in props) {
      // @ts-ignore
      inputProps[key as keyof InputSpecificProps] = props[key as keyof P];
      delete containerProps[key];
    }
  }
  
  // All ARIA props should be on the `<input/>`, since it is the element that receives the focus.
  for (const key of Object.keys(props)) {
    if (key === 'role' || key.startsWith('aria-')) {
      // @ts-ignore
      inputProps[key as keyof InputSpecificProps] = props[key as keyof P];
      delete containerProps[key];
    }
  }
  
  return {
    containerProps: containerProps as Omit<P, InputSpecificPropKeys>,
    inputProps: inputProps as InputSpecificProps,
  };
};
