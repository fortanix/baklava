/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import cl from './Checkbox.module.scss';


type CheckboxProps = {
};

/**
 * Checkbox component.
 */
export const Checkbox = ({}: CheckboxProps) => {
  return (
    <input type="checkbox" className={cl['bk-checkbox']}/>
  );
};
