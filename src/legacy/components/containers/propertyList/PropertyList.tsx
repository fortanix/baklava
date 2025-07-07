/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import './PropertyList.scss';


type PropertyProps = ComponentProps<'div'> & {
  label: React.ReactNode,
  value: React.ReactNode,
  fullWidth?: undefined | boolean,
};
export const Property = (props: PropertyProps) => {
  const { label, value, fullWidth = false, ...propsRest } = props;
  return (
    <div
      {...propsRest}
      className={cx(
        'bkl-property-list__property',
        { 'bkl-property-list__property--full-width': fullWidth },
        propsRest.className,
      )}
    >
      <dt className="bkl-property-list__property__label">{label}</dt>
      <dd className="bkl-property-list__property__value">{value}</dd>
    </div>
  );
};

type PropertyListProps = React.PropsWithChildren<{}>;
export const PropertyList = Object.assign(
  ({ children }: PropertyListProps) => {
    return (
      <dl className="bkl-property-list" data-label="bkl-property-list">
        {children}
      </dl>
    );
  },
  {
    Property,
  },
);
