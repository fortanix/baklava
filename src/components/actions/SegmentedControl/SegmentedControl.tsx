/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeProps, useMemoOnce } from '../../../util/reactUtil.ts';
import { useFocusGroup } from '../../../util/hooks/useFocusGroup.ts';
import { useStore } from 'zustand';

import { type ItemKey, useRadioGroup, useRadioGroupItem } from '../../util/collections/RadioGroupStore.tsx';
import { ToggleButton } from '../ToggleButton/ToggleButton.tsx';

import cl from './SegmentedControl.module.scss';


export { cl as SegmentedControlClassNames };

export type ButtonKey = ItemKey;

type SegmentedControlSize = 'small'; // Only supporting `small` for now

type SegmentedControlContext = {
  size: SegmentedControlSize,
  disabled: boolean,
  nonactive: boolean,
};
const SegmentedControlContext = React.createContext<null | SegmentedControlContext>(null);
const useSegmentedControlContext = (): SegmentedControlContext => {
  const context = React.use(SegmentedControlContext);
  if (context === null) { throw new Error(`Missing SegmentedControlContext`); }
  return context;
};


type SegmentedControlButtonProps = Omit<ComponentProps<typeof ToggleButton>, 'size'> & {
  buttonKey: ItemKey,
};
// Note: use `memo()` so that children don't rerendered on state change, in the case that:
// - The consumer uses this component with controlled state
// - The `children` prop on consumer side is unstable (usually the case, unless the consumer does something special)
export const SegmentedControlButton = React.memo(({ buttonKey, ...propsRest }: SegmentedControlButtonProps) => {
  const containerProps = useSegmentedControlContext();
  
  const { store, requestSelect, itemProps } = useRadioGroupItem({ itemKey: buttonKey });
  const isSelected = useStore(store, store => buttonKey === store.selectedItemKey);
  
  return (
    <ToggleButton
      // Note: the role will already be set implicitly through `focusgroup`, but we want to set it explicitly so that
      // the right `aria` attributes are set by `ToggleButton` (`aria-checked` rather than `aria-pressed`).
      role="radio"
      {...mergeProps(
        itemProps,
        propsRest,
        { className: cl['bk-segmented-control__button'] },
      )}
      embedded
      toggled={isSelected}
      onUpdateToggled={toggled => { if (toggled) { requestSelect(); } }}
      //focusgroupstart={isSelected ? '' : undefined} // Not needed, rely on `focusgroup` memory instead
      size={containerProps.size} // Do not let this be overridden locally (doesn't make sense to have mixed sizes)
      disabled={containerProps.disabled || propsRest.disabled}
      nonactive={containerProps.nonactive || propsRest.nonactive}
    />
  );
});

type SelectedState = null | ItemKey;
type PropsIrrelevant = 'defaultChecked' | 'defaultValue' | 'onSelect';
export type SegmentedControlProps = Omit<Partial<ComponentProps<'div'>>, PropsIrrelevant> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Note: currently only supports `small`, but we may introduce a 'medium' default in the future. Make this field
  // required for now so that we can change the default later.
  /** The overall size of the component. */
  size: SegmentedControlSize,
  
  /** Whether the button is currently in selected state. If `undefined`, the toggle button will be uncontrolled. */
  selected?: undefined | SelectedState,
  
  /** When uncontrolled, specifies the default selected state. Default: `false`. */
  selectedDefault?: undefined | SelectedState,
  
  /** Alias for `selectedDefault` for backwards compatbility. @deprecated */
  defaultSelected?: undefined | SelectedState,
  
  /** Callback that is called when the selected state changes. If controlled, should not be `undefined`. */
  onUpdateSelected?: undefined | ((selected: SelectedState) => void),
  
  /** Alias for `onUpdateSelected` for backwards compatbility. @deprecated */
  onUpdate?: undefined | ((selected: SelectedState) => void),
  
  /** Whether the segmented control is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** Whether the segmented control is nonactive or not. Default: false. */
  nonactive?: undefined | boolean,
};
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const {
      unstyled = false,
      size,
      selected,
      selectedDefault,
      defaultSelected, // Legacy alias
      onUpdateSelected,
      onUpdate, // Legacy alias
      disabled = false,
      nonactive = false,
      ...propsRest
    } = props;
    
    const segmentedControlContext = useMemoOnce<SegmentedControlContext>(() => ({ size, disabled, nonactive }));
    const SegmentedControlProvider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
      <SegmentedControlContext value={segmentedControlContext}>{children}</SegmentedControlContext>,
    );
    
    // TODO: add controlled/uncontrolled checks
    
    const { Provider: RadioGroupProvider, props: radioGroupProps } = useRadioGroup({
      state: selected,
      defaultState: selectedDefault ?? defaultSelected,
      defaultStateFallback: null,
      onStateChange: onUpdateSelected ?? onUpdate,
    });
    
    const focusGroupProps = useFocusGroup({ focusGroup: 'radiogroup nowrap' });
    
    return (
      <SegmentedControlProvider>
        <RadioGroupProvider>
          <div
            role="radiogroup" // Needed for the `focusgroup` polyfill, remove this once all browsers have support
            {...mergeProps(
              focusGroupProps,
              propsRest,
              radioGroupProps,
              {
                className: cx(
                  'bk',
                  { [cl['bk-segmented-control']]: !unstyled },
                  { [cl['bk-segmented-control--small']]: size === 'small' },
                  { [cl['bk-segmented-control--nonactive']]: nonactive },
                  { [cl['bk-segmented-control--disabled']]: disabled },
                ),
              },
            )}
          />
        </RadioGroupProvider>
      </SegmentedControlProvider>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
