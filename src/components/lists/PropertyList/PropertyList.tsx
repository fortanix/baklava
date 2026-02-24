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

  /**
 * Number of grid columns this property should span.
 * Only effective when the parent PropertyList has more than 1 column.
 */
  span?: number;

};
export const Property = ({ unstyled, label, value, fullWidth = false, span, style, ...propsRest }: PropertyProps) => {
  // Note: HTML allows wrapping dt/dd pairs in a `<div>`:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl#wrapping_name-value_groups_in_div_elements
  return (
    <div
      {...propsRest}
      className={cx({
        [cl['bk-property-list__property']]: !unstyled,
      }, propsRest.className)}
      style={{
        gridColumn: fullWidth
          ? '1 / -1'
          : span
            ? `span ${span}`
            : undefined,
        ...style,
      }}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
};

export type PropertyListProps = React.PropsWithChildren<ComponentProps<'dl'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  columns?: number | string
}>;
export const PropertyList = Object.assign(
  ({ unstyled = false, columns = 1, style, ...propsRest }: PropertyListProps) => {
    return (
      <dl
        {...propsRest}
        style={{
          '--bk-property-columns': columns,
          ...style,
        }}
        className={cx({
          bk: true,
          [cl['bk-property-list']]: !unstyled,
        }, propsRest.className)}
      />
    );
  },
  { Property },
);
