/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeProps } from '../../../util/reactUtil.ts';
import { useStore } from 'zustand';

import { type ItemKey, useRadioGroup, useRadioGroupItem } from '../../util/Collection/RadioGroupStore.tsx';
import { FocusGroup } from '../../util/FocusGroup/FocusGroup.tsx';
import { ToggleButton } from '../ToggleButton/ToggleButton.tsx';

import cl from './SegmentedControl.module.scss';


export { cl as SegmentedControlClassNames };


type SegmentedControlButtonProps = ComponentProps<typeof ToggleButton> & {
  buttonKey: ItemKey,
};
export const SegmentedControlButton = (props: SegmentedControlButtonProps) => {
  const { buttonKey, ...propsRest } = props;
  
  const { store, itemProps } = useRadioGroupItem({ itemKey: buttonKey });
  if (store === null) { throw new Error(`[SegmentedControlButton] Missing 'RadioGroupContext' provider`); }
  
  const isSelected = useStore(store, store => buttonKey === store.selectedItemKey);
  const selectItem = useStore(store, store => store.selectItem);
  
  const isInteractive = true; // FIXME
  const handlePress = React.useCallback(() => {
    if (!isInteractive) { return; }
    selectItem(buttonKey);
  }, [isInteractive, selectItem, buttonKey]);
  
  return (
    <ToggleButton
      {...mergeProps(
        itemProps,
        propsRest,
        { className: cl['bk-segmented-control__button'] },
      )}
      embedded
      // biome-ignore lint/a11y/useValidAriaValues: Intentionally unsetting `aria-pressed`
      aria-pressed={undefined}
      aria-checked={isSelected}
      onPress={mergeCallbacks([propsRest.onPress, handlePress])}
      // disabled={disabled}
      // nonactive={nonactive}
    />
  );
};

export type SegmentedControlProps = Omit<ComponentProps<typeof FocusGroup>, 'focusGroup' | 'defaultChecked'> & {
  /** Focus group behavior. */
  focusGroup?: React.ComponentProps<typeof FocusGroup>['focusGroup'],
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Note: currently only supports `small`, but we may introduce a 'medium' default in the future. Make this field
  // required for now so that we can change the default later.
  /** The size of the component. */
  size: 'small',
  
  /** The default button to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | ItemKey,
  
  /** The button to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | ItemKey,
  
  /** Event handler for segmented control button change events. */
  onUpdate?: undefined | ((buttonKey: ItemKey) => void),
  
  /** Whether the segmented control is disabled or not. Default: false. */
  disabled?: undefined | boolean,
};
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const { unstyled = false, size, defaultSelected, selected, onUpdate, disabled, ...propsRest } = props;
    
    const { Provider: RadioGroupProvider, props: radioGroupProps } = useRadioGroup({
      selectedItemKey: defaultSelected ?? null,
    });
    
    // FIXME: controlled usage (sync with store)
    
    return (
      <RadioGroupProvider>
        <FocusGroup
          role="radiogroup" // Needed for the polyfill, remove this once all browsers support `focusgroup`
          focusGroup="radiogroup nowrap"
          {...mergeProps(
            propsRest,
            radioGroupProps,
            {
              className: cx(
                'bk',
                { [cl['bk-segmented-control']]: !unstyled },
                { [cl['bk-segmented-control--small']]: size === 'small' },
                propsRest.className,
              ),
            },
          )}
        />
      </RadioGroupProvider>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
