/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Popper from 'react-popper';
import * as PopperJS from '@popperjs/core';

import { classNames as cx, type ComponentProps } from '../../../../util/component_util.tsx';
import { useOutsideClickHandler } from '../../../../util/hooks/useOutsideClickHandler.ts';
import { useCombinedRefs } from '../../../../util/hooks/useCombinedRefs.ts';
import {
  handleOptionKeyDown,
  handleTriggerKeyDown
} from '../../../../util/keyboardHandlers.tsx';

import { useScroller } from '../../../util/Scroller.tsx';
import { Button } from '../../../buttons/Button.tsx';
import { Checkbox } from '../../Checkbox/Checkbox.tsx';

import '../Select.scss';


export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: typeof PopperJS.createPopper;
};

export type SelectOption = {
  label: React.ReactNode,
  disabled?: undefined | boolean,
};

export type MultiSelectProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  onSelectionChange: (values: Array<string>) => void,
  options: { [key: string]: SelectOption },
  selectedValues: Array<string>,
  defaultOption?: undefined | SelectOption,
  disabled?: undefined | boolean,
  ariaLabel?: undefined | string,
  placement?: undefined | PopperOptions['placement'],
  offset?: undefined | [number, number],
  popperOptions?: undefined | PopperOptions,
  dropdownReference?: undefined | React.RefObject<HTMLUListElement>,
  isFocusTrapActive?: undefined | boolean,
};
export const MultiSelect = (props: MultiSelectProps) => {
  const {
    onSelectionChange,
    options,
    selectedValues,
    className = '',
    disabled = false,
    defaultOption = { label: '' },
    placeholder = 'Select',
    ariaLabel,
    placement = 'bottom',
    offset = [],
    popperOptions = {},
    dropdownReference,
    isFocusTrapActive = true,
    ...restProps
  } = props;
  
  const scrollerProps = useScroller();
  const optionsRef = React.useRef<HTMLInputElement[]>([]);
  const [isActive, setIsActive] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null);
  
  const widthModifiers = React.useMemo(() => [
    {
      name: 'width',
      enabled: true,
      fn: ({ state }: { state: PopperJS.State }) => {
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      effect: ({ state }: { state: PopperJS.State }) => {
        state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
      },
      phase: 'beforeWrite',
      requires: ['computeStyles'],
    },
  ], []);
  
  const popper = Popper.usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'preventOverflow', enabled: true },
      { name: 'offset', options: offset },
      ...(widthModifiers || []),
      ...(popperOptions.modifiers || []),
    ],
    placement,
  });

  const dropdownRef = { current: popperElement };
  const toggleRef = { current: referenceElement };
  const combinedRefs = useCombinedRefs(setPopperElement, dropdownReference);
  
  useOutsideClickHandler([dropdownRef, toggleRef], () => {
    setIsActive(false);
  });
  
  // Scroll to selected item when select item is opened
  React.useEffect(() => {
    if (isActive && optionsRef.current.length > 0) {
      const { scrollX, scrollY } = window;
      const selectedItem = optionsRef.current.find(item => item?.checked);
      selectedItem?.scrollIntoView({ block: 'nearest' });
      window.scrollTo(scrollX, scrollY);
    }
  }, [optionsRef, isActive]);
  
  const onContainerClick = () => {
    if (!disabled) {
      setIsActive(active => !active);
    }
  };
  
  const formatSelected = (keys: Array<string>) => {
    if (keys.length === 0) {
      return placeholder;
    }
    
    const selectedLabels = keys.map(key => {
      if (!Object.hasOwn(options, key)) {
        console.error(`Invalid key: ${key}`);
        return '(Unknown)';
      }
      
      const label = options[key].label;
      
      if (typeof label === 'string' || typeof label === 'number') {
        return String(label);
      }
      
      return key;
    });
    
    return selectedLabels.join(', ');
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const checked = target.checked;
    const value = target.value;
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter(item => item !== value));
    }
  };
  
  const renderOptions = () => {
    return Object.entries(options).map(([key, { label, disabled: optionDisabled }], index) =>
      <li
        key={key}
        role="option"
        aria-selected={selectedValues.includes(key)}
      >
        <Checkbox.Item
          id={key}
          ref={el => (optionsRef.current[index] = el)}
          className={cx(
            'bkl-select__option',
            { 'bkl-select__option--default': typeof label === 'string' },
            { 'bkl-select__option--disabled': optionDisabled },
          )}
          value={key}
          label={label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            if (!optionDisabled) {
              onChange(evt);
            }
          }}
          onKeyDown={evt => {
            handleOptionKeyDown({
              evt,
              index,
              options: optionsRef.current,
              triggerElement: referenceElement,
              onClose: () => setIsActive(false),
            });
          }}
          checked={selectedValues.includes(key)}
        />
      </li>);
  };
  
  const renderDropdown = () => {
    return (
      <ul
        ref={combinedRefs}
        id="multi-select-listbox"
        role="listbox"
        aria-multiselectable={true}
        className={cx('bkl bkl-select__dropdown', scrollerProps.className)}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        {defaultOption.label &&
          <li
            role="option"
            key={defaultOption.label}
            className={cx(
              'bkl-select__option bkl-select__option--disabled',
              { 'bkl-select__option--default': typeof defaultOption.label === 'string' },
            )}
            onKeyDown={(evt: React.KeyboardEvent) => {
              if (evt.key === 'Escape') {
                setIsActive(false);
              }
            }}
          >
            {defaultOption.label}
          </li>
        }
        {renderOptions()}
      </ul>
    );
  };
  
  return (
    <div {...restProps} className={cx('bkl bkl-select bkl-multi-select', className)}>
      <Button
        plain
        className="bkl-select__container"
        aria-haspopup="listbox"
        aria-expanded={isActive}
        aria-controls="multi-select-listbox"
        role="combobox"
        onClick={onContainerClick}
        ref={setReferenceElement}
        onKeyDown={evt => {
          handleTriggerKeyDown({
            evt,
            options: optionsRef?.current,
            onOpen: () => setIsActive(true),
            onClose: () => setIsActive(false),
          });
        }}
      >
        <i // FIXME: replace with <Icon/>
          className={cx(
            'bkl-select__caret bkl-caret bkl-caret--down', { 'bkl-select__caret--disabled': disabled },
          )}
        />
        <input
          type="text"
          className={cx(
            'bkl-select__input', {
              'bkl-select__input--changed': selectedValues.length > 0,
              'bkl-select__input--disabled': disabled,
              'bkl-select__input--active': isActive,
            },
          )}
          placeholder={placeholder}
          readOnly
          value={formatSelected(selectedValues)}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </Button>
      {isActive && ReactDOM.createPortal(renderDropdown(), document.body)}
    </div>
  );
};
