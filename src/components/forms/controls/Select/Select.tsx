/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useScroller } from '../../../../layouts/util/Scroller.tsx';
import { useFloatingElement } from '../../../util/overlays/floating-ui/useFloatingElement.tsx';
import { useListNavigation, useInteractions } from '@floating-ui/react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { Input } from '../Input/Input.tsx';

import cl from './Select.module.scss';


export { cl as SelectClassNames };


export type itemKey = string;
export type OptionDef = { itemKey: itemKey, label: string };

export type SelectContext = {
  selectedOption: null | itemKey,
  selectOption: (option: OptionDef) => void,
  getItemProps: ReturnType<typeof useInteractions>['getItemProps'],
};
export const SelectContext = React.createContext<null | SelectContext>(null);
export const useSelectContext = () => {
  const context = React.use(SelectContext);
  if (context === null) {
    throw new Error(`Missing SelectContext provider`);
  }
  return context;
};


export type OptionProps = React.PropsWithChildren<ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  itemKey: itemKey,
  
  /** The human-readable label to be shown. */
  label: string,
}>;
/**
 * Form control to select an item from a list of options through a dropdown.
 */
export const Option = (props: OptionProps) => {
  const { itemKey, label, ...propsRest } = props;
  
  const { selectedOption, selectOption, getItemProps } = useSelectContext();
  
  const option: OptionDef = { itemKey, label };
  const isSelected = typeof selectedOption === 'string' && selectedOption === itemKey;
  
  return (
    <li aria-selected={isSelected}>
      <Button unstyled
        // FIXME: requires a parent with `role="listbox"`
        role="option"
        {...propsRest}
        className={cx(
          cl['bk-select__option'],
          propsRest.className,
        )}
        {...getItemProps()}
        onPress={() => { selectOption(option); }}
      >
        {propsRest.children ?? label}
      </Button>
    </li>
  );
};

export type SelectProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  children: React.ReactElement<typeof Option> | Array<React.ReactElement<typeof Option>>,
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the select control can be searched by typing in the input. */
  searchable?: undefined | boolean,
};
/**
 * Form control to select an item from a dropdown of options.
 */
export const Select = Object.assign(
  (props: SelectProps) => {
    const { children, unstyled = false, searchable, ...propsRest } = props;
    
    const scrollerProps = useScroller();
    const selectedRef = React.useRef<React.ComponentRef<'button'>>(null);
    const [selected, setSelected] = React.useState<null | OptionDef>(null);
    
    const listRef = React.useRef([]);
    const [activeIndex, setActiveIndex] = React.useState<null | number>(null);
    const {
      refs,
      placement,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      isOpen,
      setIsOpen,
    } = useFloatingElement({
      placement: 'bottom',
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
      floatingUiInteractions: context => [
        useListNavigation(context, {
          listRef,
          activeIndex,
          onNavigate: setActiveIndex,
        }),
      ],
    });
    
    const context: SelectContext = React.useMemo(() => ({
      selectedOption: selected?.itemKey ?? null,
      selectOption: (option: OptionDef) => {
        setSelected(option);
        setIsOpen(false);
        selectedRef.current?.focus(); // Return focus
      },
      getItemProps,
    }), [selected, setIsOpen, getItemProps]);
    
    // FIXME: implement `role="listbox" and associated `aria-` attributes
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
    return (
      <SelectContext.Provider value={context}>
        <Button unstyled
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-select']]: !unstyled },
            { [cl['bk-select--open']]: isOpen },
            propsRest.className,
          )}
          {...getReferenceProps()}
          ref={mergeRefs<React.ComponentRef<typeof Button>>(selectedRef, refs.setReference)}
        >
          <Input
            className={cl['bk-select__input']}
            tabIndex={-1}
            placeholder="Select an option"
            value={selected === null ? '' : selected.label}
            onChange={() => {}}
          />
          <Icon icon="caret-down" className={cl['bk-select__input__arrow']}/>
        </Button>
        <ul
          ref={refs.setFloating}
          data-placement={placement}
          {...scrollerProps}
          {...getFloatingProps({
            popover: 'manual',
            style: floatingStyles,
            className: cx(cl['bk-select__dropdown'], scrollerProps.className),
          })}
        >
          {children}
        </ul>
      </SelectContext.Provider>
    );
  },
  { Option },
);
