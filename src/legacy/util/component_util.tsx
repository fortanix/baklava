/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Note: use the `dedupe` variant so that the consumer of a component can overwrite classes from the component
import classNamesDeduped from 'classnames/dedupe';
import type { Argument as ClassNameArgument } from 'classnames';


export type { ClassNameArgument };

export const classNames = (...args: Array<ClassNameArgument>) => {
  // Return `undefined` in case of empty string, so that we don't unnecessarily add a `class` attribute in the DOM
  return classNamesDeduped(...args) || undefined;
};


// Version of `React.ComponentPropsWithX` that supports `classnames`-based `className` props
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/84d000f858caf/types/react/index.d.ts#L836
export type ComponentProps<T extends React.ElementType> =
  Omit<React.ComponentProps<T>, 'className'> & {
    className?: undefined | ClassNameArgument,
  };
export type ComponentPropsWithRef<T extends React.ElementType> =
  Omit<React.ComponentPropsWithRef<T>, 'className'> & {
    className?: undefined | ClassNameArgument,
  };
export type ComponentPropsWithoutRef<T extends React.ElementType> =
  Omit<React.ComponentPropsWithoutRef<T>, 'className'> & {
    className?: undefined | ClassNameArgument,
  };


// Join the given array of elements together to one React node with the given separator in between
export const joinElements = (separator: React.ReactNode, elements: Array<React.ReactNode>): React.ReactNode => {
  return elements.reduce(
    (acc: React.ReactNode, element: React.ReactNode) => (
      <>
        {acc !== null &&
          <>
            {acc}
            {separator}
          </>
        }
        {element}
      </>
    ),
    null,
  );
};
