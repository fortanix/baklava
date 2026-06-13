/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeProps } from '../../../util/reactUtil.ts';

import { type ItemKey, useCollection, useCollectionItem } from '../../util/Collection/Collection.tsx';
import { FocusGroup } from '../../util/FocusGroup/FocusGroup.tsx';
import { ToggleButton } from '../ToggleButton/ToggleButton.tsx';

import cl from './SegmentedControl.module.scss';


export { cl as SegmentedControlClassNames };


type SegmentedControlButtonProps = ComponentProps<typeof ToggleButton> & {
  buttonKey: ItemKey,
};
export const SegmentedControlButton = (props: SegmentedControlButtonProps) => {
  const { buttonKey, ...propsRest } = props;
  
  const [isActive, setIsActive] = React.useState(false);
  
  const itemProps = useCollectionItem({ itemKey: buttonKey });
  
  const isInteractive = true; // FIXME
  const handlePress = React.useCallback(() => {
    setIsActive(active => {
      if (!isInteractive) { return active; }
      return !active;
    });
  }, [isInteractive]);
  
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
      aria-checked={isActive}
      onPress={mergeCallbacks([propsRest.onPress, handlePress])}
      // disabled={disabled}
      // nonactive={nonactive}
    />
  );
};

export type SegmentedControlProps = Omit<ComponentProps<typeof FocusGroup>, 'focusGroup'> & {
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
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
};
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const { unstyled = false, ...propsRest } = props;
    
    const { Provider: CollectionProvider, props: collectionProps } = useCollection();
    
    return (
      <CollectionProvider>
        <FocusGroup
          role="radiogroup" // Needed for the polyfill, remove this once all browsers support `focusgroup`
          focusGroup="radiogroup nowrap"
          {...mergeProps(
            propsRest,
            collectionProps,
            {
              className: cx(
                'bk',
                { [cl['bk-segmented-control']]: !unstyled },
                propsRest.className,
              ),
            },
          )}
        />
      </CollectionProvider>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
