/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Random from '../../../util/random.ts';
import * as ObjectUtil from '../../../util/objectUtil.ts';
import {
  isEqual,
  fromUnixTime,
  format as dateFormat,
  getUnixTime,
  set as setDate,
  isAfter as isDateAfter,
  isBefore as isDateBefore,
  isEqual as isDateEqual,
} from 'date-fns';

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { useFocus } from '../../../util/hooks/useFocus.ts';

import { Icon } from '../../graphics/Icon/Icon.tsx';
import { Tag } from '../../text/Tag/Tag.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Input } from '../../forms/controls/Input/Input.tsx';
import { CheckboxGroup } from '../../forms/controls/CheckboxGroup/CheckboxGroup.tsx';
import { DropdownMenuProvider, type DropdownRef } from '../../overlays/DropdownMenu/DropdownMenuProvider.tsx';
import { DateTimePicker } from '../../forms/controls/DateTimePicker/DateTimePicker.tsx';

import * as FQ from './filterQuery.ts';

import cl from './MultiSearch.module.scss';


// Utilities
type Primitive = null | string | number | bigint | boolean;


// Map operators to a human-readable string to be shown in the UI

const numberOperatorsToSymbolMap: Record<FQ.NumberFieldOperator, string> = {
  '$eq': '\u003D',
  '$lt': '\u003C',
  '$lte': '\u2264',
  '$gt': '\u003E',
  '$gte': '\u2265',
  '$ne': '\u2260',
} as const;

const dateTimeFieldOperatorsToSymbolMap: Record<FQ.DateTimeFieldOperator, string> = {
  '$eq': '\u003D',
  '$lt': '\u003C',
  '$lte': '\u2264',
  '$gt': '\u003E',
  '$gte': '\u2265',
  '$ne': '\u2260',
  '$range': 'Range',
} as const;

const enumOperatorsToSymbolMap: Record<FQ.EnumFieldOperator, string> = {
  '$eq': 'is',
  '$ne': 'is not',
  '$in': 'is one of',
  '$nin': 'is none of',
};

const arrayOperatorsToSymbolMap: Record<FQ.ArrayFieldOperator, string> = {
  '$eq': 'is',
  '$ne': 'is not',
  '$any': 'contains any matching',
  '$all': 'contains all matching',
};

const getOperatorLabel = (operator: FQ.Operator, field: FQ.Field): string => {
  let label = '';
  
  if (field.operatorInfo && operator in field.operatorInfo) {
    label = field.operatorInfo[operator]?.label ?? '';
  } else if (field.type === 'array') {
    label = arrayOperatorsToSymbolMap[operator as FQ.ArrayFieldOperator] ?? '';
  } else if (field.type === 'enum') {
    label = enumOperatorsToSymbolMap[operator as FQ.EnumFieldOperator] ?? '';
  } else if (field.type === 'number') {
    label = numberOperatorsToSymbolMap[operator as FQ.NumberFieldOperator] ?? '';
  } else if (field.type === 'datetime') {
    label = dateTimeFieldOperatorsToSymbolMap[operator as FQ.DateTimeFieldOperator] ?? '';
  }
  
  return label;
};


//
// Query filter management
//

type UseFiltersProps = {
  fields: FQ.Fields, // Field definitions
  customFilters: FQ.FilterQuery, // The filter query
  query: (filters: FQ.FilterQuery) => void, // Callback to be called with the latest filter query
};
// Custom hook to manage a `FilterQuery` instance
const useFilters = (props: UseFiltersProps) => {
  const {
    fields,
    customFilters,
    query,
  } = props;
  
  const [filters, setFilters] = React.useState<FQ.FilterQuery>([]);
  
  React.useEffect(() => {
    setFilters(customFilters ?? []);
  }, [customFilters]);
  
  const addFilter = (options: {
    fieldName: FQ.FieldName,
    value: Primitive | Array<Primitive>,
    selectedOperator?: undefined | null | FQ.Operator,
    selectedSubOperator?: undefined | null | FQ.Operator,
    key?: undefined | string,
  }) => {
    const {
      fieldName,
      value,
      selectedOperator = null,
      selectedSubOperator = null,
      key = '',
    } = options;
    
    const fieldQuery = FQ.encodeFieldQuery(fieldName, value, selectedOperator, selectedSubOperator, fields, key);
    
    if (fieldName && fields && typeof fields[fieldName]?.onAddFilter === 'function' && fieldQuery) {
      const field = fields[fieldName];
      // biome-ignore lint/style/noNonNullAssertion: onAddFilter is guaranteed to exist by the guard above
      const updatedFilters = field.onAddFilter!(fieldQuery, filters);
      query?.(updatedFilters);
    } else if (fieldQuery) {
      const newFilters = [...filters, fieldQuery];
      query?.(newFilters);
    }
  };
  
  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    query?.(newFilters);
  };
  
  const removeAllFilters = () => {
    query?.([]);
  };
  
  return {
    filters,
    setFilters,
    addFilter,
    removeFilter,
    removeAllFilters,
  };
};

type FiltersProps = {
  fields: FQ.Fields,
  filters?: FQ.FilterQuery,
  onRemoveFilter?: (index: number) => void,
  onRemoveAllFilters: () => void,
};
export const Filters = (props: FiltersProps) => {
  const {
    fields,
    filters = [],
    onRemoveFilter,
    onRemoveAllFilters,
  } = props;
  
  const renderDateTimeFilter = (filter: FQ.FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand } = FQ.decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;
    const fieldNameLabel = typeof field?.label === 'string' ? field?.label : '';
    let symbol = ':';

    if (field && operatorSymbol && field.type === 'datetime') {
      if (operatorSymbol === 'range') {
        symbol = '';
      } else {
        symbol = ` ${operatorSymbol}`;
      }
    }

    let operandLabel: { from: string, to: string } | string = '';

    if (field && field.type === 'datetime') {
      if (operatorSymbol === 'range') {
        if (FQ.isRangeOperationValue(operand)) {
          const rangeOperand = operand as [number, number];
          const startDateTime = dateFormat(rangeOperand[0] * 1000, 'MMMM do yyyy HH:mm');
          const endDateTime = dateFormat(rangeOperand[1] * 1000, 'MMMM do yyyy HH:mm');
          operandLabel = { from: startDateTime, to: endDateTime };
        }
      } else {
        // Here operand should be a number
        const singleOperand = operand as number;
        const dateTime = dateFormat(singleOperand * 1000, 'MMMM do yyyy HH:mm');
        operandLabel = dateTime;
      }
    }
    
    const content: React.ReactNode = fieldNameLabel
      ? (
        <>
          <span>{`${fieldNameLabel}${symbol}`} </span>
          {typeof operandLabel === 'string'
            ? <span className={cx(cl['filter-value'])}>{operandLabel}</span>
            : (
              <>
                <span className={cx(cl['filter-operand'])}>from</span>
                <span className={cx(cl['filter-value'])}>{operandLabel.from}</span>
                <span className={cx(cl['filter-operand'])}>to</span>
                <span className={cx(cl['filter-value'])}>{operandLabel.to}</span>
              </>
            )
          }
        </>
      ) : `${operandLabel}`;
    
    return (
      <Tag
        className={cx(cl['bk-multi-search__filter'])}
        onRemove={() => { onRemoveFilter?.(index); }}
        content={content}
      />
    );
  };
  
  const renderArrayFilter = (filter: FQ.FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand, subOperatorSymbol = '' } = FQ.decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;
    const subField = field && field.type === 'array' ? field.subfield : null;
    const fieldNameLabel = typeof field?.label === 'string' ? field?.label : '';
    let symbol = ':';

    if (field && operatorSymbol && field.type === 'array') {
      symbol = ` ${operatorSymbol} ${subOperatorSymbol}`;
    }

    let operandLabel = '';
    
    if (subField) {
      if (subField.type === 'enum') {
        if (Array.isArray(operand)) {
          operandLabel = (operand as string[]).map(o => subField.alternatives[o]?.label || o).join(', ');
        } else {
          operandLabel = subField.alternatives[operand as string]?.label || (operand as string);
        }
      } else if (subField.type === 'number') {
        operandLabel = String(operand);
      }
    }
    
    return (
      <Tag
        className={cx(cl['bk-multi-search__filter'])}
        onRemove={() => { onRemoveFilter?.(index); }}
        content={
          fieldNameLabel
            ? (
              <>
                <span>{`${fieldNameLabel}${symbol}`} </span>
                <span className={cx(cl['filter-value'])}>{operandLabel}</span>
              </>
            ) : `${operandLabel}`
        }
      />
    );
  };

  const renderFilter = (filter: FQ.FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand } = FQ.decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;

    if (field) {
      if (field.type === 'datetime') {
        return renderDateTimeFilter(filter, index);
      }
      if (field.type === 'array') {
        return renderArrayFilter(filter, index);
      }
    }

    const fieldNameLabel = typeof field?.label === 'string' ? field?.label : '';
    let symbol = ':';
    
    if (field && operatorSymbol) {
      if (field.type === 'number' || field.type === 'enum') {
        symbol = ` ${operatorSymbol}`;
      }
    }
    
    let operandLabel: string;
    
    if (field && field.type === 'enum') {
      if (Array.isArray(operand)) {
        operandLabel = (operand as string[]).map(o => field.alternatives[o]?.label || o).join(', ');
      } else {
        operandLabel = field.alternatives[operand as string]?.label || (operand as string);
      }
    } else if (field && field.type === 'dictionary') {
      const dictOperand = operand as Record<string, unknown>;
      operandLabel = Object.keys(dictOperand).map(key => {
        const keyLabel = field.suggestedKeys?.[key]?.label ?? key;
        return `${keyLabel} = ${String(dictOperand[key])}`;
      }).join(', ');
    } else {
      operandLabel = String(operand);
    }
    
    return (
      <Tag
        key={filter.fieldName}
        className={cx(cl['bk-multi-search__filter'])}
        onRemove={() => { onRemoveFilter?.(index); }}
        content={
          fieldNameLabel
            ? (
              <>
                <span>{`${fieldNameLabel}${symbol}`} </span>
                <span className={cx(cl['filter-value'])}>{operandLabel}</span>
              </>
            ) : `${operandLabel}`
        }
      />
    );
  };

  const renderActions = () => {
    return filters.length > 0 && (
      <div className={cx(cl['bk-multi-search__filter-actions'])}>
        <span
          // biome-ignore lint/a11y/useSemanticElements:
          // span used as clickable wrapper to keep custom layout & avoid button semantics
          role="button"
          tabIndex={0}
          className={cx(cl['clear-all'])}
          onKeyDown={onRemoveAllFilters}
          onClick={onRemoveAllFilters}
        >
          Clear all
        </span>
      </div>
    );
  };

  if (filters.length === 0) {
    return null;
  }
  
  return (
    <div className={cx(cl['bk-multi-search__filters'])}>
      <div className={cx(cl['bk-multi-search__filters-wrapper'])}>
        {filters.map(renderFilter)}
      </div>
      {renderActions()}
    </div>
  );
};


//
// Suggestions dropdown
//


export type SuggestionProps = Omit<ComponentProps<'div'>, 'children'> & {
  label: string,
  items: React.ReactNode,
  elementRef?: undefined | React.RefObject<HTMLInputElement | null>, // Helps to toggle multiple dropdowns on the same reference element
  active?: undefined | boolean,
  onOutsideClick?: undefined | (() => void),
};
export const Suggestions = (props: SuggestionProps) => {
  const {
    className,
    active = false,
    label = '',
    items = '',
    elementRef,
    onOutsideClick,
  } = props;

  const dropdownRef = React.useRef<DropdownRef>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) onOutsideClick?.();
  };

  return (
    <DropdownMenuProvider
      className={cx(cl['bk-multi-search__dropdown'], className)}
      placement='bottom-start'
      ref={dropdownRef}
      label={label}
      items={items}
      open={active}
      onOpenChange={handleOpenChange}
      anchorRef={elementRef as React.RefObject<HTMLElement | null>}
    />
  );
};

export type SearchInputProps = ComponentProps<typeof Input> & {
  fields: FQ.Fields,
  fieldQueryBuffer: FieldQueryBuffer,
  inputRef: React.RefObject<HTMLInputElement | null>
};
export const SearchInput = (props: SearchInputProps) => {
  const {
    className,
    onKeyDown,
    fields,
    fieldQueryBuffer,
    inputRef,
    onFocus,
    onBlur,
    ...propsRest
  } = props;
  
  const {
    isFocused,
    handleFocus,
    handleBlur,
  } = useFocus<HTMLInputElement>({ onFocus, onBlur });
  
  const field = fieldQueryBuffer.fieldName ? fields[fieldQueryBuffer.fieldName] : null;
  let operator = ':';

  if (fieldQueryBuffer.operator) {
    if (fieldQueryBuffer.operator === '$range') {
      operator = ':';
    } else if (field) {
      operator = ` ${getOperatorLabel(fieldQueryBuffer.operator, field)}`;
    }
  }

  const subField = field?.type === 'array' && field.subfield ? field.subfield : null;
  let subOperator = '';

  if (fieldQueryBuffer.subOperator) {
    if (fieldQueryBuffer.subOperator === '$range') {
      subOperator = ':';
    } else if (subField) {
      subOperator = ` ${getOperatorLabel(fieldQueryBuffer.subOperator, subField)}`;
    }
  }

  let key = '';

  if (field?.type === 'dictionary' && fieldQueryBuffer.key.trim()) {
    key = field.suggestedKeys?.[fieldQueryBuffer.key.trim()]?.label ?? fieldQueryBuffer.key.trim();
  }
  
  const onWrapperClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    
    if (inputRef?.current) {
      inputRef.current.click();
    }
  };
  
  const onWrapperKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();

      if (inputRef?.current) {
        inputRef.current.click();
      }
    }
  };

  const renderPlaceholder = () => {
    if (field?.type === 'dictionary' && key) {
      return `Enter a value for ${key}`;
    }

    return field?.placeholder ?? 'Search';
  };
  
  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements:
      // div used as clickable wrapper to keep custom layout & avoid button semantics
      role="button"
      tabIndex={0}
      className={cx(cl['bk-search-input'], className, { [cl['bk-search-input--active']]: isFocused })}
      onClick={onWrapperClick}
      onKeyDown={onWrapperKeyDown}
    >
      <Icon icon="search" className={cx(cl['bk-search-input__search-icon'])} />
      {field &&
        <span className={cx(cl['bk-search-input__search-key'])}>
          {field.label}{operator}{subOperator} {key ? `${key} =` : ''}
        </span>
      }
      <Input
        placeholder={renderPlaceholder()}
        className={cx(cl['bk-search-input__input'])}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...propsRest}
        ref={mergeRefs(inputRef, propsRest.ref)}
      />
    </div>
  );
};

type FieldsDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement | null>,
  isActive?: boolean,
  fields?: FQ.Fields,
  onClick: (fieldName?: string) => void,
  onOutsideClick?: () => void,
};

const FieldsDropdown = (props: FieldsDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    fields,
    onClick,
    onOutsideClick,
  } = props;

  if (typeof fields === 'undefined') {
    return null;
  }

  const menuItems = Object.entries(fields || {}).map(([fieldName, { label }]) => (
    <DropdownMenuProvider.Action
      key={fieldName}
      itemKey={fieldName}
      label={label}
      onActivate={() => { onClick(fieldName); }}
    />
  ));

  return (
    <Suggestions
      label="Fields"
      items={menuItems}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      active={isActive}
    />
  );
};

type AlternativesDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement | null>,
  isActive?: boolean,
  alternatives?: FQ.Alternatives,
  selectedOperator: FQ.Operator,
  onChange: (value: Primitive[]) => void,
  onOutsideClick?: () => void,
  validator?: FQ.ArrayValidator<FQ.ArrayFieldSpec>,
};

const AlternativesDropdown = (props: AlternativesDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    alternatives,
    onChange,
    onOutsideClick,
    selectedOperator,
    validator,
  } = props;

  if (!alternatives) return null;

  const [selectedAlternatives, setSelectedAlternatives] = React.useState<Array<string>>([]);
  
  const canSelectMultipleItems = ['$in', '$nin', '$any', '$all'].includes(selectedOperator);
  
  const ValidateSelection = () => {
    let isValid = selectedAlternatives.length > 0;
    let message = '';
    if (validator && selectedAlternatives.length > 0) {
      const validatorResponse = validator({ buffer: selectedAlternatives });
      isValid = validatorResponse.isValid;
      message = validatorResponse.message;
    }
    return { isValid, message };
  };
  
  const arrayValidation = ValidateSelection();
  
  const onSelectionComplete = () => {
    onChange(selectedAlternatives);
  };
  const renderMultiSelectAlternatives = () => (
    <>
      <CheckboxGroup
        orientation="vertical"
        selected={new Set(selectedAlternatives)}
        onUpdate={set => setSelectedAlternatives(Array.from(set))}
        className={cx(cl['bk-multi-search__alternatives-group'])}
      >
        {Object.entries(alternatives).map(([key, { label }]) => (
          <CheckboxGroup.Checkbox
            key={key}
            checkboxKey={key}
            label={label}
          />
        ))}
      </CheckboxGroup>
      {!arrayValidation.isValid && arrayValidation.message && (
        <span className={cx(cl['bk-multi-search__dropdown-error-msg'])}>
          {arrayValidation.message}
        </span>
      )}
      <div className={cx(cl['bk-multi-search__alternatives-action'])}>
        <Button
          kind="primary"
          onPress={onSelectionComplete}
          nonactive={!arrayValidation.isValid}
        >
          Done
        </Button>
      </div>
    </>
  );

  const renderSingleSelectAlternatives = () =>
    Object.entries(alternatives).map(([key, { label }]) => (
      <DropdownMenuProvider.Action
        key={key}
        itemKey={key}
        label={label}
        onActivate={() => onChange([key])}
      />
    ));

  return (
    <Suggestions
    className={cx(cl['bk-multi-search__alternatives'])}
      label="Alternatives"
      active={isActive}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      items={
        canSelectMultipleItems
          ? renderMultiSelectAlternatives()
          : renderSingleSelectAlternatives()
      }
    />
  );
};

type DateTimeDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement | null>,
  isActive?: boolean,
  onChange: (value: number | [number, number]) => void,
  onOutsideClick?: () => void,
  maxDate?: Date | number | undefined,
  minDate?: Date | number | undefined,
  selectedDate?: FQ.SelectedDate | undefined,
  canSelectDateTimeRange?: boolean | undefined,
  validator?: FQ.DateTimeValidator | undefined,
};

const DateTimeDropdown = (props: DateTimeDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    onChange,
    onOutsideClick,
    maxDate,
    minDate,
    selectedDate,
    canSelectDateTimeRange,
    validator,
  } = props;

  const dateTimeMeridiemRef = React.useRef(null);


  const isValidDateParamType = (date: number | Date | undefined) => {
    return !!(date && typeof date === 'number' || date instanceof Date);
  };

  const isValidSelectedDate = (selectedDate: FQ.SelectedDate | undefined) => {
    if (Array.isArray(selectedDate) && selectedDate.length === 2) {
      return isValidDateParamType(selectedDate[0]) && isValidDateParamType(selectedDate[1]);
    }

    return isValidDateParamType(selectedDate as number | Date | undefined);
  };

  const getDateObject = (date: Date | number): Date => {
    return typeof date === 'number'
      ? fromUnixTime(date)
      : date;
  };

  const isSingleDate = (date: FQ.SelectedDate): date is FQ.DateType =>
    typeof date === 'number' || date instanceof Date;


  const isDateRange = (date: FQ.SelectedDate): date is [FQ.DateType, FQ.DateType] =>
    Array.isArray(date) && date.length === 2;
  

  const initDateTime = (selectedDate: FQ.SelectedDate | undefined | null, range: 'start' | 'end') => {
    const defaultDate = setDate(new Date(), { seconds: 0, milliseconds: 0 });
    if (!selectedDate) {
      return defaultDate;
    }

    let date = defaultDate;

    // First, check if it's a single date
    if (isSingleDate(selectedDate) && isValidDateParamType(selectedDate)) {
      // Now it's safe to call isValidDateParamType(selectedDate)
      date = getDateObject(selectedDate);
    } else if (isValidSelectedDate(selectedDate) && isDateRange(selectedDate)) {
      // It's a date range
      if (range === 'start') {
        date = getDateObject(selectedDate[0]);
      } else if (range === 'end') {
        date = getDateObject(selectedDate[1]);
      }
    }

    return date;
  };

  const [dateTime, setDateTime] = React.useState(initDateTime(selectedDate, 'start'));
  const [startDateTime, setStartDateTime] = React.useState(initDateTime(selectedDate, 'start'));
  const [endDateTime, setEndDateTime] = React.useState(initDateTime(selectedDate, 'end'));

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedDate is the only variable
  React.useEffect(() => {
    if (isValidSelectedDate(selectedDate)) {
      const updatedDateTime = initDateTime(selectedDate, 'start');
      if (!isEqual(updatedDateTime, dateTime)) {
        setDateTime(updatedDateTime);
      }

      const updatedStartDateTime = initDateTime(selectedDate, 'start');
      if (!isEqual(updatedStartDateTime, startDateTime)) {
        setStartDateTime(updatedStartDateTime);
      }

      const updatedEndDateTime = initDateTime(selectedDate, 'end');
      if (!isEqual(updatedEndDateTime, endDateTime)) {
        setEndDateTime(updatedEndDateTime);
      }
    }
  }, [selectedDate]);

  const onSelectionComplete = () => {
    if (canSelectDateTimeRange) {
      onChange([getUnixTime(startDateTime), getUnixTime(endDateTime)]);
    } else {
      onChange(getUnixTime(dateTime));
    }
  };

  const validateDateTimeRange = (): { isValid: boolean, message: string } => {
    let isValid = false;
    let message = '';

    if (canSelectDateTimeRange) {
      if (minDate) {
        isValid = isDateEqual(startDateTime, new Date(minDate))
          || (isDateAfter(startDateTime, new Date(minDate)) && isDateAfter(endDateTime, new Date(minDate)));
      }

      if (maxDate) {
        isValid = isDateEqual(endDateTime, new Date(maxDate))
          || (isDateBefore(endDateTime, new Date(maxDate)) && isDateBefore(startDateTime, new Date(maxDate)));
      }

      if (!minDate && !maxDate) {
        isValid = true;
      }

      if (isValid) {
        isValid = isDateBefore(startDateTime, endDateTime) || isDateEqual(startDateTime, endDateTime);
        if (!isValid) {
          message = 'End date cannot be before the start date';
        }
      }
    } else {
      if (minDate) {
        isValid = isDateEqual(dateTime, new Date(minDate)) || isDateAfter(dateTime, new Date(minDate));
      }

      if (maxDate) {
        isValid = isDateEqual(dateTime, new Date(maxDate)) || isDateBefore(dateTime, new Date(maxDate));
      }

      if (!minDate && !maxDate) {
        isValid = true;
      }
    }

    if (isValid && typeof validator === 'function') {
      const validatorResponse = validator({ dateTime, startDateTime, endDateTime });
      isValid = validatorResponse.isValid;
      message = validatorResponse.message;
    }

    return { isValid, message };
  };

  const dateTimeRangeValidation = validateDateTimeRange();
  
  const renderDateTimeRangePicker = () => (
    <>
      <div className={cx(cl['bk-multi-search__date-time-group'])}>
        <div className={cx(cl['bk-multi-search__date-time-label'])}><span>Start Date</span></div>
        <DateTimePicker
          date={startDateTime}
          onChange={(date) => setStartDateTime(initDateTime(date, 'start'))}
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
        />
      </div>

      <div className={cx(cl['bk-multi-search__date-time-group'])}>
        <div className={cx(cl['bk-multi-search__date-time-label'])}><span>End Date</span></div>
        <DateTimePicker
          date={endDateTime}
          onChange={(date) => setEndDateTime(initDateTime(date, 'end'))}
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
        />
      </div>
    
      {!dateTimeRangeValidation.isValid
        && dateTimeRangeValidation.message
        && (
          <span className={cx(cl['bk-multi-search__dropdown-error-msg'])}>
            {dateTimeRangeValidation.message}
          </span>
        )
      }
      
      <div className={cx(cl['bk-multi-search__date-time-action'])}>
        <Button
          kind="primary"
          onPress={onSelectionComplete}
          nonactive={!dateTimeRangeValidation.isValid}
        >
          Done
        </Button>
      </div>
    </>
  );

  const renderDateTimePicker = () => (
    <>
      <div className={cx(cl['bk-multi-search__date-time-group'])}>
        <DateTimePicker
          date={dateTime}
          onChange={(date) => setDateTime(initDateTime(date, 'start'))}
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
        />
      </div>

      <div className={cx(cl['bk-multi-search__date-time-action'])}>
        <Button
          kind="primary"
          onPress={onSelectionComplete}
          nonactive={!dateTimeRangeValidation.isValid}
        >
          Done
        </Button>
      </div>
    </>
  );

  return (
    <Suggestions
      className={cx(cl['bk-multi-search__date-time'])}
      label="Date/Time"
      active={isActive}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      items={canSelectDateTimeRange ? renderDateTimeRangePicker() : renderDateTimePicker()}
    />
  );
};

type SuggestedKeysDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement | null>,
  isActive?: boolean,
  operators?: FQ.DictionaryFieldOperators[],
  suggestedKeys?: FQ.SuggestedKeys | undefined,
  onChange: (value: string) => void,
  onOutsideClick?: () => void,
};

const SuggestedKeysDropdown = (props: SuggestedKeysDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    suggestedKeys,
    onChange,
    onOutsideClick,
  } = props;

  const [customKey, setCustomKey] = React.useState('');

  const items = (
    <>
      {Object.entries(suggestedKeys || {}).map(([suggestedKey, { label }]) => (
        <DropdownMenuProvider.Action
          key={suggestedKey}
          itemKey={suggestedKey}
          label={label}
          onActivate={() => onChange(suggestedKey)}
        />
      ))}

      <div key="custom" className={cx(cl['bk-multi-search__suggested-key-input'])}>
        <Input
          placeholder="Enter a custom key"
          value={customKey}
          onChange={e => setCustomKey(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && customKey.trim() !== '') {
              onChange(customKey.trim());
              setCustomKey('');
            }
          }}
        />
      </div>
    </>
  );

  return (
    <Suggestions
      className={cx(cl[' bk-multi-search__suggested-keys'])}
      label="Keys"
      active={isActive}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      items={items}
    />
  );
};

type OperatorsDropdownProps = {
  type: FQ.Field['type'],
  inputRef: React.RefObject<HTMLInputElement | null>,
  isActive: boolean,
  operators: Array<FQ.NumberFieldOperator | FQ.DateTimeFieldOperator | FQ.EnumFieldOperator | FQ.ArrayFieldOperator>,
  onClick: (key?: FQ.NumberFieldOperator | FQ.DateTimeFieldOperator | FQ.EnumFieldOperator | FQ.ArrayFieldOperator) => void,
  onOutsideClick?: () => void,
  operatorInfo?: FQ.OperatorInfo | undefined,
};

const OperatorsDropdown = (props: OperatorsDropdownProps) => {
  const {
    type,
    inputRef,
    isActive = false,
    operators,
    onClick,
    onOutsideClick,
    operatorInfo = {},
  } = props;

  if (operators.length === 0) { return null; }

  let symbolMap: Partial<Record<FQ.Operator, string>> = {};

  if (type === 'enum') {
    symbolMap = enumOperatorsToSymbolMap;
  } else if (type === 'array') {
    symbolMap = arrayOperatorsToSymbolMap;
  } else if (type === 'number') {
    symbolMap = numberOperatorsToSymbolMap;
  } else if (type === 'datetime') {
    symbolMap = dateTimeFieldOperatorsToSymbolMap;
  }

  symbolMap = ObjectUtil.map(symbolMap, (label, operator) =>
    operator in operatorInfo ? operatorInfo[operator as FQ.Operator]?.label : label,
  ) as Partial<Record<FQ.Operator, string>>;

  const items = operators.map((op) => {
    const operatorSymbol = symbolMap[op] ?? op;
    return (
      <DropdownMenuProvider.Action
        className={cx(cl[' bk-multi-search__operator'])}
        key={op}
        itemKey={op}
        label={String(operatorSymbol)}
        onActivate={() => {
          onClick(op);
        }}
      />
    );
  });

  return (
    <Suggestions
      label="Operators"
      active={isActive}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      items={items}
    />
  );
};

type FieldQueryBuffer = {
  fieldName: FQ.FieldName,
  operator: FQ.Operator | null,
  subOperator: FQ.Operator | null,
  key: string,
  value: string,
};

export const initializeFieldQueryBuffer = (): FieldQueryBuffer => ({
  fieldName: '',
  operator: null,
  subOperator: null,
  key: '',
  value: '',
});

export type MultiSearchProps = Omit<ComponentProps<'input'>, 'className' | 'children'> & {
  className?: ClassNameArgument,
  fields: FQ.Fields,
  query?: (filters: FQ.FilterQuery) => void;
  filters?: FQ.FilterQuery,
};
export const MultiSearch = (props: MultiSearchProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  
  const {
    className,
    fields,
    query = () => { },
    onFocus,
    onClick,
    disabled,
    filters: customFilters = FQ.createFilterQuery(),
  } = props;
  
  const { filters, addFilter, removeFilter, removeAllFilters } = useFilters({
    fields,
    customFilters,
    query,
  });
  const [fieldQueryBuffer, setFieldQueryBuffer] = React.useState<FieldQueryBuffer>(initializeFieldQueryBuffer);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [validatorResponse, setValidatorResponse] = React.useState({ isValid: true, message: '' });
  
  const updateFieldQueryBuffer = (newFieldQuery: FieldQueryBuffer) => {
    setFieldQueryBuffer(newFieldQuery);
  };
  
  const validateFieldQuery = (fieldQueryBuffer: FieldQueryBuffer): FQ.ValidatorResponse => {
    let isValid = fieldQueryBuffer.value?.trim() !== '';
    let message = '';
    
    if (fieldQueryBuffer.fieldName && Object.hasOwn(fields, fieldQueryBuffer.fieldName)) {
      // biome-ignore lint/style/noNonNullAssertion: fieldName is guaranteed to exist by the hasOwn guard above
      const field: FQ.Field = fields[fieldQueryBuffer.fieldName]!;
      if (field.type === 'text') {
        const searchInputValidator = field.validator as FQ.TextValidator;
        if (isValid && typeof searchInputValidator === 'function') {
          const validatorResponse = searchInputValidator({ buffer: fieldQueryBuffer.value });
          isValid = validatorResponse.isValid;
          message = validatorResponse.message;
        }
      } else if (field.type === 'number') {
        const searchInputValidator = field.validator as FQ.TextValidator;
        if (isValid) {
          const inputNumber = Number(fieldQueryBuffer.value);
          if (Number.isNaN(inputNumber) || !Number.isFinite(inputNumber)) {
            isValid = false;
            message = 'Please enter a valid value';
          } else if (typeof searchInputValidator === 'function') {
            const validatorResponse = searchInputValidator({ buffer: fieldQueryBuffer.value });
            isValid = validatorResponse.isValid;
            message = validatorResponse.message;
          }
        }
      } else if (field.type === 'array') {
        const searchInputValidator = field.validator as FQ.ArrayValidator<FQ.ArrayFieldSpec>;
        if (isValid) {
          if (field.subfield && field.subfield.type === 'enum') {
            isValid = Object.values(field.subfield.alternatives).filter(alternative =>
              alternative.label.toLowerCase() === fieldQueryBuffer.value.toLowerCase()).length > 0;
            if (!isValid) {
              message = 'Please enter a valid value';
            }
          } else if (typeof searchInputValidator === 'function') {
            const validatorResponse = searchInputValidator({ buffer: [fieldQueryBuffer.value] });
            isValid = validatorResponse.isValid;
            message = validatorResponse.message;
          }
        }
      } else if (field.type === 'enum') {
        const searchInputValidator = field.validator as FQ.EnumValidator<FQ.EnumFieldSpec>;
        if (isValid) {
          isValid = Object.values(field.alternatives).filter(alternative =>
            alternative.label.toLowerCase() === fieldQueryBuffer.value.toLowerCase()).length > 0;
          if (!isValid) {
            message = 'Please enter a valid value';
          } else if (typeof searchInputValidator === 'function') {
            const validatorResponse = searchInputValidator({ buffer: fieldQueryBuffer.value });
            isValid = validatorResponse.isValid;
            message = validatorResponse.message;
          }
        }
      } else if (field.type === 'dictionary') {
        const searchInputValidator = field.validator as FQ.DictionaryValidator;
        if (typeof searchInputValidator === 'function') {
          const validatorResponse = searchInputValidator({ key: fieldQueryBuffer.key, buffer: fieldQueryBuffer.value });
          isValid = validatorResponse.isValid;
          message = validatorResponse.message;
        } else {
          // This is needed for custom attribute
          // where we just want to search based on attribute key (disregarding the value)
          isValid = true;
        }
      } else if (field.type === 'datetime') {
        const searchInputValidator = field.validator as FQ.DateTimeValidator;
        if (isValid) {
          const dateTime = new Date(fieldQueryBuffer.value);
          if (Number.isNaN(dateTime.valueOf())) {
            isValid = false;
            message = 'Please enter a valid value';
          } else if (typeof searchInputValidator === 'function') {
            const validatorResponse = searchInputValidator({
              dateTime,
              startDateTime: new Date(),
              endDateTime: new Date(),
            });
            isValid = validatorResponse.isValid;
            message = validatorResponse.message;
          }
        }
      }
    }
    setValidatorResponse({ isValid, message });
    return { isValid, message };
  };
  
  const onInputKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      
      const validatorResponse = validateFieldQuery(fieldQueryBuffer);
      if (validatorResponse.isValid) {
        let fieldValue: string | string[] | number = fieldQueryBuffer.value;
        if (fieldQueryBuffer.fieldName && Object.hasOwn(fields, fieldQueryBuffer.fieldName)) {
          // biome-ignore lint/style/noNonNullAssertion: fieldName is guaranteed to exist by the hasOwn guard above
          const field: FQ.Field = fields[fieldQueryBuffer.fieldName]!;
          if (field.type === 'enum' || (field.type === 'array' && field.subfield?.type === 'enum')) {
            fieldValue = [fieldQueryBuffer.value];
          } else if (field.type === 'datetime') {
            fieldValue = getUnixTime(new Date(fieldQueryBuffer.value));
          }
        }
        addFilter({
          fieldName: fieldQueryBuffer.fieldName,
          value: fieldValue,
          selectedOperator: fieldQueryBuffer.operator,
          selectedSubOperator: fieldQueryBuffer.subOperator,
          key: fieldQueryBuffer.key,
        });
        updateFieldQueryBuffer(initializeFieldQueryBuffer());
      }
    } else if (evt.key === 'Backspace' && fieldQueryBuffer.value === '' && fieldQueryBuffer.fieldName) {
      evt.preventDefault();
      
      if (fieldQueryBuffer.key) {
        updateFieldQueryBuffer({ ...fieldQueryBuffer, key: '' });
      } else if (fieldQueryBuffer.subOperator && FQ.operators.includes(fieldQueryBuffer.subOperator)) {
        updateFieldQueryBuffer({ ...fieldQueryBuffer, subOperator: null });
      } else if (fieldQueryBuffer.operator && FQ.operators.includes(fieldQueryBuffer.operator)) {
        updateFieldQueryBuffer({ ...fieldQueryBuffer, operator: null, subOperator: null });
      } else {
        updateFieldQueryBuffer(initializeFieldQueryBuffer());
      }
      
      validateFieldQuery(fieldQueryBuffer);
    }
  };
  
  const onInputChange = (evt: React.ChangeEvent) => {
    const value = (evt.currentTarget as HTMLInputElement).value;
    updateFieldQueryBuffer({ ...fieldQueryBuffer, value });
    if (value === '') {
      setValidatorResponse({ isValid: true, message: '' });
    }
  };
  
  const onSearchInputFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    setIsInputFocused(true);
    onFocus?.(evt);
  };
  
  const onOutsideClick = () => {
    if (document.activeElement !== inputRef.current) {
      setIsInputFocused(false);
    }
  };
  
  const renderSearchInput = () => (
    <SearchInput
      inputRef={inputRef}
      fields={fields}
      fieldQueryBuffer={fieldQueryBuffer}
      value={fieldQueryBuffer.value}
      onKeyDown={onInputKeyDown}
      onChange={onInputChange}
      onFocus={onSearchInputFocus}
      onClick={onClick}
      disabled={disabled}
    />
  );
  
  const renderFieldsDropdown = () => {
    const isActive = isInputFocused && !fieldQueryBuffer.fieldName && fieldQueryBuffer.value === '';
    
    const onFieldClick = (fieldName?: string) => {
      if (!fieldName) { return; }
      
      const field = fields[fieldName];
      
      if (!field) {
        return null;
      }
      
      const newFieldQuery: FieldQueryBuffer = {
        ...fieldQueryBuffer,
        fieldName,
      };
      
      if (['number', 'datetime', 'enum', 'array'].includes(field.type) && field.operators.length === 1) {
        // biome-ignore lint/style/noNonNullAssertion: Length already checked
        newFieldQuery.operator = field.operators[0]!;
      }
      
      if (field.type === 'array' && field.subfield.operators.length === 1) {
        // biome-ignore lint/style/noNonNullAssertion: Length already checked
        newFieldQuery.subOperator = field.subfield.operators[0]!;
      }
      
      updateFieldQueryBuffer(newFieldQuery);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    return (
      <FieldsDropdown
        isActive={isActive}
        inputRef={inputRef}
        fields={fields}
        onClick={onFieldClick}
        onOutsideClick={onOutsideClick}
      />
    );
  };
  
  const renderAlternativesDropdown = () => {
    const { fieldName, operator, subOperator } = fieldQueryBuffer;
    
    if (!fieldName || !operator) { return null; }
    
    const field = fields[fieldName];
    
    if (!field) {
      return null;
    }
    
    let alternatives = {};
    
    if (field.type === 'enum') {
      alternatives = field.alternatives;
    } else if (field.type === 'array' && field.subfield.type === 'enum') {
      alternatives = field.subfield.alternatives;
    }
    
    if (!Object.keys(alternatives).length) {
      return null;
    }
    
    const isActive = isInputFocused
      && field
      && ((field.type === 'enum' && !!operator)
        || (field.type === 'array' && !!operator && (!!subOperator || ['$eq', '$ne'].includes(operator)))
      )
      && fieldQueryBuffer.value === '';
    
    const onAlternativesChange = (value: Primitive[]) => {
      addFilter({
        fieldName,
        value,
        selectedOperator: operator,
        selectedSubOperator: subOperator,
      });
      updateFieldQueryBuffer(initializeFieldQueryBuffer());
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    return (
      <AlternativesDropdown
        isActive={isActive}
        inputRef={inputRef}
        alternatives={alternatives}
        onChange={onAlternativesChange}
        onOutsideClick={onOutsideClick}
        selectedOperator={field.type === 'array' ? '$any' : operator}
        validator={field.validator as FQ.ArrayValidator<FQ.ArrayFieldSpec>}
      />
    );
  };
  
  const renderDateTimeSelectorDropdown = () => {
    const { fieldName, operator } = fieldQueryBuffer;
    
    if (!fieldName) { return null; }
    
    const field = fields[fieldName];
    
    if (field?.type !== 'datetime') { return null; }
    
    const isActive = isInputFocused
      && field
      && !!operator
      && fieldQueryBuffer.value === '';
    
    const onDateTimeRangeChange = (value: number | [number, number]) => {
      addFilter({ fieldName, value, selectedOperator: operator });
      
      updateFieldQueryBuffer(initializeFieldQueryBuffer());
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    const canSelectDateTimeRange = () => {
      return operator === '$range';
    };
    
    return (
      <DateTimeDropdown
        isActive={isActive}
        inputRef={inputRef}
        onChange={onDateTimeRangeChange}
        onOutsideClick={onOutsideClick}
        maxDate={field.maxDate}
        minDate={field.minDate}
        canSelectDateTimeRange={canSelectDateTimeRange()}
        validator={field.validator}
        selectedDate={field.selectedDate}
      />
    );
  };
  
  const renderSuggestedKeysDropdown = () => {
    const { fieldName } = fieldQueryBuffer;
    
    if (!fieldName) { return null; }
    
    const field = fields[fieldName];
    
    if (field?.type !== 'dictionary') { return null; }
    
    const isActive = isInputFocused && field && fieldQueryBuffer.value === '' && fieldQueryBuffer.key === '';
    
    const onSuggestedKeysChange = (key: string) => {
      updateFieldQueryBuffer({ ...fieldQueryBuffer, key });
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    return (
      <SuggestedKeysDropdown
        isActive={isActive}
        inputRef={inputRef}
        operators={field.operators}
        suggestedKeys={field.suggestedKeys}
        onChange={onSuggestedKeysChange}
        onOutsideClick={onOutsideClick}
      />
    );
  };
  
  const renderOperatorsDropdown = () => {
    const { fieldName } = fieldQueryBuffer;
    
    if (!fieldName) { return null; }
    
    const field = fields[fieldName];
    
    const operatorTypes = ['number', 'datetime', 'enum', 'array'];
    
    if (!field
      || (field.type !== 'number'
        && field.type !== 'datetime'
        && field.type !== 'enum'
        && field.type !== 'array'
      )
    ) { return null; }
    
    const isFieldSupported = field && operatorTypes.includes(field.type);
    
    const isActive = isInputFocused
      && isFieldSupported
      && !fieldQueryBuffer.operator
      // If only one operator is supported, then no need to show dropdown.
      && field.operators.length > 1
      && fieldQueryBuffer.value === '';
    
    const onOperatorClick = (
      operator?: FQ.NumberFieldOperator | FQ.DateTimeFieldOperator | FQ.EnumFieldOperator | FQ.ArrayFieldOperator,
    ) => {
      if (typeof operator === 'undefined') { return; }
      
      const newFieldQuery = { ...fieldQueryBuffer, operator };
      
      if (field.type === 'array' && field.subfield.operators.length === 1) {
        newFieldQuery.subOperator = field.subfield.operators[0] || null;
      }
      
      updateFieldQueryBuffer(newFieldQuery);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    return (
      <OperatorsDropdown
        type={field.type}
        isActive={isActive}
        inputRef={inputRef}
        operators={field.operators}
        onClick={onOperatorClick}
        onOutsideClick={onOutsideClick}
        operatorInfo={field.operatorInfo}
      />
    );
  };
  
  const renderSubOperatorsDropdown = () => {
    const { fieldName, operator } = fieldQueryBuffer;
      
    if (!fieldName) { return null; }
    
    const field = fields[fieldName];
    
    if (!field || field.type !== 'array') { return null; }
    
    const subOperatorTypes = ['enum', 'number'];
    const subField = field.subfield;
    
    if (!subField || (subField.type !== 'number' && subField.type !== 'enum')) {
      return null;
    }
    
    const isFieldSupported = subField && subOperatorTypes.includes(subField.type);
    
    const isActive = isInputFocused
      && isFieldSupported
      && !!operator
      && !['$eq', '$ne'].includes(operator)
      && !fieldQueryBuffer.subOperator
      // If only one sub operator is supported, then no need to show dropdown.
      && subField.operators.length > 1
      && fieldQueryBuffer.value === '';
    
    const onOperatorClick = (
      key?: FQ.NumberFieldOperator | FQ.DateTimeFieldOperator | FQ.EnumFieldOperator | FQ.ArrayFieldOperator
    ) => {
      if (typeof key === 'undefined') { return; }
      
      updateFieldQueryBuffer({ ...fieldQueryBuffer, subOperator: key as FQ.Operator });
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    return (
      <OperatorsDropdown
        type={subField.type}
        isActive={isActive}
        inputRef={inputRef}
        operators={subField.type === 'enum'
          ? subField.operators.filter(op => op !== '$eq' && op !== '$ne')
          : subField.operators}
        onClick={onOperatorClick}
        onOutsideClick={onOutsideClick}
        operatorInfo={field.subfield.operatorInfo}
      />
    );
  };
  
  return (
    <div className={cx(cl['bk-multi-search'], className)}>
      {renderSearchInput()}
      {renderFieldsDropdown()}
      {renderAlternativesDropdown()}
      {renderDateTimeSelectorDropdown()}
      {renderSuggestedKeysDropdown()}
      {renderOperatorsDropdown()}
      {renderSubOperatorsDropdown()}
      {!validatorResponse.isValid && validatorResponse.message && (
        <span className={cx(cl['bk-multi-search__error-msg'])}>
          {validatorResponse.message}
        </span>
      )}
      <Filters
        fields={fields}
        filters={filters}
        onRemoveFilter={removeFilter}
        onRemoveAllFilters={removeAllFilters}
      />
    </div>
  );
};
