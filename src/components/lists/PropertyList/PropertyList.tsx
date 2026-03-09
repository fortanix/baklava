/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { Property } from '../Property/Property.tsx';

import cl from './PropertyList.module.scss';

const ListProperty = (props: React.ComponentProps<typeof Property>) =>
  <Property
    {...props}
    className={cx(cl['bk-property-list__property'], props.className)}
  />;

export type PropertyListProps = React.PropsWithChildren<ComponentProps<'dl'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** 
   * The orientation of the property's, either horizontal or vertical. 
   * 
   * Default: `"horizontal"`. 
   */
  orientation?: undefined | 'horizontal' | 'vertical',
}>;
export const PropertyList = Object.assign(
  ({ unstyled = false, orientation, ...propsRest }: PropertyListProps) => {
    return (
      <dl
        {...propsRest}
        className={cx(
          {
            bk: true,
            [cl['bk-property-list']]: !unstyled,
            [cl['bk-property-list--horizontal']]: orientation === 'horizontal',
            [cl['bk-property-list--vertical']]: orientation === 'vertical',
          },
          propsRest.className,
        )}
      />
    );
  },
  { Property: ListProperty },
);
