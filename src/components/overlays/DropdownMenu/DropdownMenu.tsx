/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';

import { type IconName, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';

import cl from './DropdownMenu.module.scss';


export { cl as DropdownMenuClassNames };


export type OptionKey = string;
export type OptionDef = { optionKey: OptionKey, label: string };

export type OptionState = { option: OptionDef, selected: boolean };
export type DropdownMenuContext = {
  // Additional props to pass to the option
  optionProps?: undefined | ((optionState: OptionState) => Record<string, unknown>),
  
  selectedOption: null | OptionKey, // The key of the currently selected option (if any)
  selectOption: (option: OptionDef) => void, // Select the given option
  
  close: () => void, // Request dropdown menu close
};
export const DropdownMenuContext = React.createContext<null | DropdownMenuContext>(null);
export const useDropdownMenuContext = (): DropdownMenuContext => {
  const context = React.use(DropdownMenuContext);
  if (context === null) { throw new Error(`Missing DropdownMenuContext provider`); }
  return context;
};


export type ActionProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** A unique identifier for this action. */
  itemKey: OptionKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** The icon to be displayed (if any). */
  icon?: undefined | IconName,
  
  /** The event handler for when the user activates this action. */
  onActivate: (context: DropdownMenuContext) => void,
}>;
/**
 * A dropdown menu item that can be triggered to perform some action.
 */
export const Action = (props: ActionProps) => {
  const { itemKey, label, icon, onActivate, ...propsRest } = props;
  
  const context = useDropdownMenuContext();
  const { optionProps, selectedOption, selectOption } = context;
  
  const option: OptionDef = { optionKey: itemKey, label };
  const isSelected = selectedOption === itemKey;
  
  return (
    <li aria-selected={isSelected}>
      <Button unstyled
        role="option"
        {...propsRest}
        {...optionProps?.({
          option,
          selected: false,
        })}
        // FIXME: merge these props with `optionProps()`
        className={cx(
          cl['bk-dropdown-menu__item'],
          cl['bk-dropdown-menu__item--action'],
          propsRest.className,
        )}
        onClick={() => { onActivate(context); }}
      >
        {icon && <Icon icon={icon}/>}
        {label ?? propsRest.children}
      </Button>
    </li>
  );
};


export type OptionProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  optionKey: OptionKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** The icon to be displayed (if any) */
  icon?: undefined | IconName,
}>;
/**
 * A dropdown menu item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { optionKey, label, icon, ...propsRest } = props;
  const { selectedOption, selectOption, optionProps } = useDropdownMenuContext();
  
  const option: OptionDef = { optionKey, label };
  const isSelected = selectedOption === optionKey;
  
  return (
    <li aria-selected={isSelected}>
      <Button unstyled
        role="option"
        {...propsRest}
        {...optionProps?.({
          option,
          selected: isSelected,
        })}
        // FIXME: merge these props with `optionProps()`
        className={cx(
          cl['bk-dropdown-menu__item'],
          cl['bk-dropdown-menu__item--option'],
          propsRest.className,
        )}
        onClick={() => { selectOption(option); }}
      >
        {icon && <Icon icon={icon} className={cl['bk-dropdown-menu__item__icon']}/>}
        <span className={cl['bk-dropdown-menu__item__label']}>{label ?? propsRest.children}</span>
      </Button>
    </li>
  );
};

export type DropdownMenuProps = React.PropsWithChildren<ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Dropdown menu with a list of selectable options.
 */
export const DropdownMenu = Object.assign(
  (props: DropdownMenuProps) => {
    const { children, unstyled = false, ...propsRest } = props;
    
    const scrollerProps = useScroller();
    
    return (
      <ul
        {...scrollerProps}
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-dropdown-menu']]: !unstyled },
          scrollerProps.className,
          propsRest.className,
        )}
      >
        {children}
      </ul>
    );
  },
  { Action, Option },
);
