
/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Input } from '../../forms/controls/Input/Input.tsx';

// import './SearchInput.scss';


export type SearchInputProps = React.ComponentPropsWithoutRef<typeof Input>;
export const SearchInput = (props: SearchInputProps) => {
  return (
    <div className={cx('bkl-input--search', props.className)}>
      <Icon name="search" icon="search"
        className="bkl-input--search__icon"
      />
      <Input
        placeholder="Search"
        className="bkl-input--search__input"
        {...props}
      />
    </div>
  );
};

SearchInput.displayName = 'SearchInput';
