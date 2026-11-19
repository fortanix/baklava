/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeProps } from '../../../util/reactUtil.ts';
import { ItemKey } from '../../util/collections/CollectionStore.tsx';
import { useRadioGroup } from '../../util/collections/RadioGroupStore.tsx';

import { StepperTabsButton, StepperTabsContext } from './StepperTabsButton.tsx';
import { StepperTabsList } from './StepperTabsList.tsx';
import { StepperTabsContent } from './StepperTabsContent.tsx';
import { StepperTabsBody } from './StepperTabsBody.tsx';

import cl from './StepperTabs.module.scss';

export { cl as StepperTabsClassNames };

type SelectedState = null | ItemKey;
type SelectedStateProps = (
  | {
    selected?: undefined, // Uncontrolled
    defaultSelected?: undefined | SelectedState,
    onSelectedChange?: undefined | ((selected: SelectedState) => void),
  }
  | {
    selected: SelectedState, // Controlled
    defaultSelected?: undefined,
    onSelectedChange: (selected: SelectedState) => void,
  }
);

/**
 * A vertical, step-based tab navigation component that organizes a form or multi-step workflow into individual sections, with the corresponding content displayed in an adjacent panel.
 */

type PropsOmit = keyof SelectedStateProps | 'defaultChecked' | 'defaultValue' | 'onSelect';
export type StepperTabsProps = Omit<ComponentProps<'div'>, PropsOmit> & SelectedStateProps & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the segmented control is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** Whether the segmented control is nonactive or not. Default: false. */
  nonactive?: undefined | boolean,
};

export const StepperTabs = Object.assign((props: StepperTabsProps) => {
  const {
    selected,
    defaultSelected,
    onSelectedChange,
    disabled = false,
    nonactive = false,
    ...propsRest
  } = props;

  const ref = React.useRef<null | HTMLDivElement>(null);
  const stepperTabsContext = React.useMemo<StepperTabsContext>(() => ({
    disabled,
    nonactive,
  }), [disabled, nonactive]);
    
  
  const { Provider: RadioGroupProvider, context: radioGroupContext, props: radioGroupProps } = useRadioGroup({
    state: selected,
    defaultState: defaultSelected,
    defaultStateFallback: null,
    onStateChange: onSelectedChange,
  });
    
  return (
    <StepperTabsContext value={stepperTabsContext}>
      <RadioGroupProvider value={radioGroupContext}>
        <div
          {...mergeProps(
            propsRest,
            {
            ref,
            className: cx(
              'bk',
              cl['bk-stepper-tabs'],
              { [cl['bk-stepper-tabs--nonactive']]: nonactive },
              { [cl['bk-stepper-tabs--disabled']]: disabled },
            )}
          )}
        />
      </RadioGroupProvider>
    </StepperTabsContext>
  );
},
  {
    Trigger: StepperTabsButton,
    List: StepperTabsList,
    Content: StepperTabsContent,
    Body: StepperTabsBody,
  },
);
