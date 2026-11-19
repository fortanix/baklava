/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeProps } from '../../../util/reactUtil.ts';

import cl from './StepperTabsBody.module.scss';

export type StepperTabsBodyProps = ComponentProps<'div'>;

// Note: use `memo()` so that children don't rerendered on state change, in the case that:
// - The consumer uses this component with controlled state
// - The `children` prop on consumer side is not memoized/static (usually the case)
export const StepperTabsBody = React.memo((props: StepperTabsBodyProps) => {
  return (   
    <div
      {...mergeProps(
        props,
        {
          className: cx(
            'bk',
            cl['bk-stepper-tabs__body'],
          )
        }
      )}
    />
  );
});
