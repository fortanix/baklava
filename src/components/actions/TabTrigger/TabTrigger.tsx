/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks } from '../../../util/reactUtil.ts';
import { useControllableState } from '../../../util/hooks/useControllableState.ts';

import { Button } from '../Button/Button.tsx';
import { H6 } from '../../../typography/Heading/Heading.tsx';

import cl from './TabTrigger.module.scss';

export { cl as TabTriggerClassNames };

type ButtonPropsIrrelevant = 'unstyled' | 'trimmed' | 'kind' | 'variant' | 'asyncTimeout';
export type TabTriggerProps = Omit<ComponentProps<typeof Button>, ButtonPropsIrrelevant> & {
  title?: string,
  indicator?: React.ReactNode,
  description?: React.ReactNode,

  /**
   * Whether the button is currently in the selected state. If `undefined`, the selection button will be uncontrolled. */
  selected?: undefined | boolean,
  
  /** When uncontrolled, specifies the default selected state. Default: `false`. */
  defaultSelected?: undefined | boolean,
  
  /** Callback that is called when the selected state changes. If controlled, should not be `undefined`. */
  onSelectedChange?: undefined | ((selected: boolean) => void),
};
/**
 * A component that allows users to select and switch between tabs.
 */
export const TabTrigger = (props: TabTriggerProps) => {
  const {
    title,
    indicator,
    description,
    selected,
    defaultSelected,
    onSelectedChange,
    disabled,
    nonactive,
    children,
    ...propsRest
  } = props;

  const { state: selectedState, updateState: updateToggledState } = useControllableState<boolean>({
    componentName: 'ToggleButton',
    propName: 'selected',
    state: selected,
    defaultState: defaultSelected,
    stateFallback: false,
    onStateChange: onSelectedChange,
  });
  
  const isInteractive = !disabled && !nonactive;
  const handlePress = () => {
    if (isInteractive) {
      updateToggledState(selected => !selected);
    }
  };
  
  const renderLayout = () => {
    return (
      <div className={cl['bk-tab-trigger__layout']}>
        <div className={cl['bk-tab-trigger__layout-header']}>
          <div className={cl['bk-tab-trigger__layout-title']}>
            <H6>{title}</H6>
          </div>
          <div className={cl['bk-tab-trigger__layout-indicator']}>
            {indicator}
          </div>
        </div>
        {description && (
          <div className={cl['bk-tab-trigger__layout-description']}>
            {description}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Button
      wrap={false}
      aria-selected={selected}
      unstyled
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-tab-trigger'],
        { [cl['bk-tab-trigger--nonactive']]: nonactive },
        { [cl['bk-tab-trigger--selected']]: selected },
        propsRest.className,
      )}
      onPress={mergeCallbacks([propsRest.onPress, handlePress])}
      disabled={disabled}
      nonactive={nonactive}
    >
      {children ? children : renderLayout()}
    </Button>
  );
};
