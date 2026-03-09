/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { Property } from '../Property/Property.tsx';

import cl from './PropertyGrid.module.scss';

const GridProperty = (props: React.ComponentProps<typeof Property>) => {
  const { size = 'small' } = props;
  return <Property
    {...props}
    className={cx(cl['bk-property-grid__property'],
      {
        [cl['bk-property-grid__property--small']]: size === 'small',
        [cl['bk-property-grid__property--medium']]: size === 'medium',
        [cl['bk-property-grid__property--large']]: size === 'large',
        [cl['bk-property-grid__property--full-size']]: size === 'full-size'
      },
      props.className)}
  />
};

export type PropertyGridProps = ComponentProps<'dl'> & {
  /** Whether this component should be unstyled */
  unstyled?: undefined | boolean

  /** Number of grid columns
   * Defaults to 4.
   */
  columns?: undefined | number
};

export const PropertyGrid = Object.assign(
  ({ unstyled = false, columns = 4, ...propsRest }: PropertyGridProps) => {
    return (
      <dl
        {...propsRest}
        className={cx(
          {
            bk: true,
            [cl['bk-property-grid']]: !unstyled,
          },
          propsRest.className,
        )}
        style={{
          ...propsRest.style,
          '--bk-property-grid-column': columns,
        }}
      />
    );
  },
  { Property: GridProperty },
);
