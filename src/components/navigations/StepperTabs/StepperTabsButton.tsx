/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeProps } from '../../../util/reactUtil.ts';
import { ItemKey } from '../../util/collections/CollectionStore.tsx';
import { useRadioGroupItem } from '../../util/collections/RadioGroupStore.tsx';

import { TabTrigger } from '../../actions/TabTrigger/TabTrigger.tsx';

export type StepperTabsContext = {
  disabled: boolean,
  nonactive: boolean,
};
export const StepperTabsContext = React.createContext<null | StepperTabsContext>(null);
const useStepperTabsContext = (): StepperTabsContext => {
  const context = React.use(StepperTabsContext);
  if (context === null) { throw new Error(`Missing StepperTabsContext`); }
  return context;
};

type StepperTabsButtonProps = ComponentProps<typeof TabTrigger> & {
  tabKey: ItemKey,
};
// Note: use `memo()` so that children don't rerendered on state change, in the case that:
// - The consumer uses this component with controlled state
// - The `children` prop on consumer side is not memoized/static (usually the case)
export const StepperTabsButton = React.memo(({ tabKey, ...propsRest }: StepperTabsButtonProps) => {
  const containerProps = useStepperTabsContext();
  
  const { selected, requestSelected, props: itemProps } = useRadioGroupItem({ itemKey: tabKey });
  
  const handleSelectedChange = React.useCallback((selected: boolean) => {
    if (selected) { requestSelected(); }
  }, [requestSelected]);
  
  return (
    <TabTrigger
      role="tab"
      {...mergeProps(
        itemProps,
        propsRest,
      )}
      id={tabKey}
      selected={selected}
      onSelectedChange={handleSelectedChange}
      //TODO - add focus controls
      //focusgroupstart={isSelected ? '' : undefined} // Not needed, rely on `focusgroup` memory instead
      // size={containerProps.size} // Do not let this be overridden locally (doesn't make sense to have mixed sizes)
      disabled={containerProps.disabled || propsRest.disabled}
      nonactive={containerProps.nonactive || propsRest.nonactive}
      aria-controls={`tabpanel-${tabKey}`}
      {...!selected ? { tabIndex: -1 } : {}}
    />
  );
});
