/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ClassNameArgument } from '../../../util/component_util.tsx';

import './SelectPlaceholderSkeleton.scss';

// Loading skeleton (when there's no data to show yet)
type SelectPlaceholderSkeletonProps = { className?: undefined | ClassNameArgument };
export const SelectPlaceholderSkeleton = (props: SelectPlaceholderSkeletonProps) => {
  return (
    <div className={cx('bkl-select-placeholder bkl-select-placeholder--skeleton', props.className)}>
      {Array.from({ length: 5 }).map((_, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: No other key available
        <span key={index} className="skeleton-row"/>, // eslint-disable-line react/no-array-index-key
      )}
    </div>
  );
};
