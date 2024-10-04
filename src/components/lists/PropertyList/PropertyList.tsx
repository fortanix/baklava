/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './PropertyList.module.scss';


export { cl as PropertyListClassNames };

type PropertyProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The label of the property */
  label: React.ReactNode,
  
  /** The value of the property */
  value: React.ReactNode,
  
  /** Whether this property should take up all available space */
  fullWidth?: boolean,
};
export const Property = ({ unstyled, label, value, fullWidth = false, ...propsRest }: PropertyProps) => {
  // Note: HTML allows wrapping dt/dd pairs in a `<div>`:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl#wrapping_name-value_groups_in_div_elements
  return (
    <div
      {...propsRest}
      className={cx({
        [cl['bk-property-list__property']]: !unstyled,
        [cl['bk-property-list__property--full-width']]: fullWidth,
      }, propsRest.className)}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
};

export type PropertyListProps = React.PropsWithChildren<ComponentProps<'dl'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
export const PropertyList = Object.assign(
  ({ unstyled = false, ...propsRest }: PropertyListProps) => {
    return (
      <dl
        {...propsRest}
        className={cx({
          bk: true,
          [cl['bk-property-list']]: !unstyled,
        }, propsRest.className)}
      />
    );
  },
  { Property },
);
