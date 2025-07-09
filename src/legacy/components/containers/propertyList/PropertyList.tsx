/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './PropertyList.scss';

type PropertyProps = ComponentPropsWithoutRef<'div'> & {
  label: React.ReactNode,
  value: React.ReactNode,
  fullWidth?: boolean,
};
export const Property = ({ label, value, fullWidth = false, ...props }: PropertyProps) => {
  return (
    <div
      {...props}
      className={cx(
        'bkl-property-list__property',
        { 'bkl-property-list__property--full-width': fullWidth },
        props.className,
      )}
    >
      <dt className="bkl-property-list__property__label">{label}</dt>
      <dd className="bkl-property-list__property__value">{value}</dd>
    </div>
  );
};

type PropertyListProps = React.PropsWithChildren<{}>;
export const PropertyList = Object.assign(({ children }: PropertyListProps) => {
  return (
    <dl className="bkl-property-list" data-label="bkl-property-list">
      {children}
    </dl>
  );
}, { Property, displayName: 'PropertyList' });
