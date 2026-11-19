/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeProps } from '../../../util/reactUtil.ts';
import { ItemKey } from '../../util/collections/CollectionStore.tsx';
import { useRadioGroupItem } from '../../util/collections/RadioGroupStore.tsx';

import cl from './StepperTabsContent.module.scss';

export type StepperTabsContentProps = ComponentProps<'div'> & {
  tabKey: ItemKey,
};

// Note: use `memo()` so that children don't rerendered on state change, in the case that:
// - The consumer uses this component with controlled state
// - The `children` prop on consumer side is not memoized/static (usually the case)
export const StepperTabsContent = React.memo(({ tabKey, ...restProps }: StepperTabsContentProps) => {
  const { selected, props: itemProps } = useRadioGroupItem({ itemKey: tabKey });
    
  return (
    <React.Activity mode={selected ? 'visible' : 'hidden'}>
      <div
        role="tabpanel"
        aria-labelledby={tabKey}
        id={`tabpanel-${tabKey}`}
        {...mergeProps(
          restProps,
          {
            className: cx(
              'bk',
              cl['bk-stepper-tabs__content'],
            )
          }
        )}
      />
    </React.Activity>
  );
});
