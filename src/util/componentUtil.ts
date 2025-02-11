/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component using
// `<MyComponent className={{ foo: false }}/>`
import classNamesDedupe from 'classnames/dedupe';
import type { Argument as ClassNameArgument, ArgumentArray } from 'classnames';


export type { ClassNameArgument };

export const classNames = (...args: ArgumentArray): string => {
  const className = classNamesDedupe(...args);
  
  if (import.meta.env.MODE === 'development' && className.split(' ').includes('undefined')) {
    console.warn('Found `undefined` in class names list');
  }
  
  return className;
};

// Version of `React.ComponentProps` that supports `classnames` syntax for the `className` attribute. So that
// components can take class names not just of type string, but any valid classnames `Argument`, e.g.:
//   `<MyComponent className={['example1', { example2: condition() }]}/>`
export type ComponentProps<T extends React.ElementType> =
  Omit<React.ComponentProps<T>, 'className'> & {
    className?: undefined | ClassNameArgument,
  };
