/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component using
// `<MyComponent className={{ foo: false }}/>`
import classNames from 'classnames/dedupe';
import type { Argument as ClassNameArgument } from 'classnames';


export { classNames, type ClassNameArgument };

// Version of `React.ComponentPropsWithRef` that supports `classnames` syntax for the `className` attribute. So that
// components can take class names not just of type string, but any valid classnames `Argument`, e.g.:
//   `<MyComponent className={['example1', { example2: condition() }]}/>`
export type ComponentProps<T extends React.ElementType> =
  Omit<React.ComponentPropsWithRef<T>, 'className'> & {
    className?: undefined | ClassNameArgument,
  };

export const joinElements = (
  separator: React.ReactNode,
  elements: Array<React.ReactNode>
): React.ReactNode => {
  if (!elements.length) return null;

  return elements.reduce<React.ReactNode[]>((acc, element, index) => {
    if (index > 0) acc.push(separator);
    acc.push(element);
    return acc;
  }, []);
};