import * as React from 'react';
import { classNames as cx, ClassNameArgument } from '../../../util/component_util';

import './SelectPlaceholderSkeleton.scss';

// Loading skeleton (when there's no data to show yet)
type SelectPlaceholderSkeletonProps = { className?: ClassNameArgument };
export const SelectPlaceholderSkeleton = (props: SelectPlaceholderSkeletonProps) => {
  return (
    <div className={cx('bkl-select-placeholder bkl-select-placeholder--skeleton', props.className)}>
      {Array.from({ length: 5 }).map((_, index) =>
        <span key={index} className="skeleton-row"/>, // eslint-disable-line react/no-array-index-key
      )}
    </div>
  );
};

SelectPlaceholderSkeleton.displayName = 'SelectPlaceholderSkeleton';
