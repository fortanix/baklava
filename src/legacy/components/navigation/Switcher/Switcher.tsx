/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';

import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';
import { handleTabKeyDown } from '../../../util/keyboardHandlers.tsx';

import { Button } from '../../buttons/Button.tsx';

import './Switcher.scss';


export type SwitcherOptionKey = string;

type SwitcherButtonProps = ComponentProps<'button'> & {
  ref?: undefined | React.Ref<HTMLButtonElement>,
  optionKey: SwitcherOptionKey,
};

type SwitcherButtonPropsInternal = SwitcherButtonProps & {
  // Additional props injected by `SwitcherButtons` through `React.cloneElement()`
  active: boolean,
  onSelect: () => void,
  switchersRef: React.RefObject<Array<HTMLButtonElement>>,
  switcherIndex: number,
};
const SwitcherButton = (props: SwitcherButtonPropsInternal) => {
  const {
    ref,
    className,
    optionKey,
    children,
    active,
    onSelect,
    onClick,
    disabled = false,
    switchersRef,
    switcherIndex,
    tabIndex,
    ...propsRest
  } = props;
  
  const registerElement = React.useCallback((element: null | HTMLButtonElement) => {
    if (element) {
      switchersRef.current[switcherIndex] = element;
    }
  }, [switchersRef, switcherIndex]);
  
  return (
    <Button
      plain
      // FIXME: use an `<input type="radio"/>` instead?
      role="radio"
      tabIndex={tabIndex ?? (active ? 0 : -1)}
      {...propsRest}
      disabled={disabled}
      aria-selected={active}
      ref={mergeRefs(registerElement, ref)}
      className={cx('bkl-switcher-button', className, { 'active': active, 'disabled': disabled })}
      onClick={evt => {
        onSelect();
        onClick?.(evt);
      }}
      onKeyDown={(evt: React.KeyboardEvent<HTMLButtonElement>) => {
        handleTabKeyDown({
          evt,
          index: switcherIndex,
          tabs: switchersRef.current,
        });
      }}
    >
      {children}
    </Button>
  );
};

type SwitcherButtonsProps<O extends SwitcherOptionKey> = Omit<ComponentProps<'div'>, 'onChange'> & {
  children: Array<React.ReactElement<SwitcherButtonProps>>,
  selected: O,
  onChange: (optionKey: O) => void,
};
export const SwitcherButtons = Object.assign(
  <O extends SwitcherOptionKey>(props: SwitcherButtonsProps<O>) => {
    const { children, selected, onChange, ...propsRest } = props;
    const switchersRef = React.useRef<Array<HTMLButtonElement>>([]);
    
    const childrenArray = React.Children.toArray(children) as Array<React.ReactElement<SwitcherButtonPropsInternal>>;
    const buttons = childrenArray.map(button => {
      const optionKey = button.props.optionKey as O;
      
      return React.cloneElement(button, {
        switcherIndex: childrenArray.findIndex(child => child.props.optionKey === optionKey),
        active: optionKey === selected,
        onSelect: () => { onChange(optionKey); },
        switchersRef,
      });
    });
    
    return (
      <div {...propsRest} role="radiogroup" className={cx('bkl bkl-switcher-buttons', props.className)}>
        {buttons}
      </div>
    );
  },
  {
    Button: SwitcherButton as React.ComponentType<SwitcherButtonProps>,
  },
);
