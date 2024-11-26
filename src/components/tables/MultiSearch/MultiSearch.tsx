/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Random from '../../../util/random';
import * as ObjectUtil from '../../../util/object_util';
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
import * as ReactDOM from 'react-dom';
import { classNames as cx, ClassNameArgument, ComponentPropsWithoutRef } from '../../../util/component_util';
import * as Popper from 'react-popper';

import { useOutsideClickHandler } from '../../../util/hooks/useOutsideClickHandler';

import { BaklavaIcon } from '../../../components/icons/icon-pack-baklava/BaklavaIcon';
import Input from '../../../components/forms/input/Input';
import * as Dropdown from '../../../components/overlays/dropdown/Dropdown';
import { Tag } from '../../../components/containers/tag/Tag';
import { useCombinedRefs } from '../../../util/hooks/useCombinedRefs';
import { useFocus } from '../../../util/hooks/useFocus';
import Checkbox from '../../../components/forms/checkbox/Checkbox';
import { Button } from '../../../components/buttons/Button';
import { DateTimePicker } from '../../../components/forms/datetime/DateTimePicker';
import { Caption } from '../../../components/typography/caption/Caption';

import './MultiSearch.scss';


// Suggestions dropdown
const SuggestionItem = Dropdown.Item;

export type SuggestionProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode),
  elementRef?: React.RefObject<HTMLInputElement>, // Helps to toggle multiple dropdowns on the same reference element
  active?: boolean,
  withArrow?: boolean,
  primary?: boolean,
  secondary?: boolean,
  basic?: boolean,
  popperOptions?: Dropdown.PopperOptions,
  onOutsideClick?: () => void,
  containerRef?: React.RefObject<HTMLInputElement>,
};
export const Suggestions = (props: SuggestionProps) => {
  const {
    active = false,
    className = '',
    withArrow = false,
    primary = false,
    secondary = false,
    basic = false,
    children = '',
    elementRef,
    popperOptions = {},
    onOutsideClick,
    containerRef,
  } = props;
  
  const [isActive, setIsActive] = React.useState(false);

  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(elementRef?.current ?? null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = React.useState<HTMLElement | null>(null);
  const popper = Popper.usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'preventOverflow', enabled: true },
      ...(popperOptions.modifiers || []),
    ],
    placement: popperOptions.placement,
  });

  React.useEffect(() => {
    if (elementRef?.current) {
      setReferenceElement(elementRef?.current);
    }
  }, [elementRef]);
  
  const onClose = () => {
    setIsActive(false);
  };

  const dropdownRef = { current: popperElement };
  const toggleRef = { current: referenceElement };
  useOutsideClickHandler([dropdownRef, toggleRef, ...(containerRef ? [containerRef] : [])], onOutsideClick ?? onClose);

  const renderDropdownItems = (dropdownItems: React.ReactElement) => {
    const dropdownChildren = dropdownItems.type === React.Fragment
      ? dropdownItems.props.children
      : dropdownItems;

    return React.Children.map(dropdownChildren, child => {
      const { onActivate: childOnActivate, onClose: childOnClose } = child.props;

      return child.type !== SuggestionItem
        ? child
        : React.cloneElement(child, {
          onActivate: (value: string | number) => { childOnActivate(value); },
          onClose: childOnClose ?? onClose,
        });
    });
  };

  const renderDropdown = () => {
    return (
      <div
        ref={setPopperElement}
        className={cx('bkl-dropdown', className, {
          'bkl-dropdown--primary': primary,
          'bkl-dropdown--secondary': secondary,
          'bkl-dropdown--basic': basic,
          'bkl-dropdown--with-arrow': withArrow,
        })}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        <ul className="bkl-dropdown__menu" role="menu" aria-labelledby="menubutton">
          {typeof children === 'function'
            ? children({ close: onClose })
            : renderDropdownItems(children as React.ReactElement)
          }
        </ul>
        {withArrow && <div className="bkl-dropdown__arrow" ref={setArrowElement} style={popper.styles.arrow}/>}
      </div>
    );
  };
  
  return (
    <>
      {(isActive || active) && ReactDOM.createPortal(renderDropdown(), document.body)}
    </>
  );
};

// Utility
type ValueOf<T extends ReadonlyArray<unknown>> = T[number];

// Operators
const enumFieldOperators = ['$in', '$nin', '$eq', '$ne'] as const;
type EnumFieldOperator = ValueOf<typeof enumFieldOperators>;

const arrayFieldOperators = ['$eq', '$ne', '$all', '$any'] as const;
type ArrayFieldOperator = ValueOf<typeof arrayFieldOperators>;

const textFieldOperators = ['$eq', '$text'] as const;
type TextFieldOperator = ValueOf<typeof textFieldOperators>;

const numberFieldOperators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne'] as const;
type NumberFieldOperator = ValueOf<typeof numberFieldOperators>;

const dictionaryFieldOperators = ['$all'] as const;
type DictionaryFieldOperators = ValueOf<typeof dictionaryFieldOperators>;

const recordFieldOperators = ['$all', '$any'] as const;
type RecordFieldOperators = ValueOf<typeof recordFieldOperators>;

const dateTimeFieldOperators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$range'] as const;
type DateTimeFieldOperator = ValueOf<typeof dateTimeFieldOperators>;

const operators = [
  ...enumFieldOperators,
  ...arrayFieldOperators,
  ...textFieldOperators,
  ...numberFieldOperators,
  ...dictionaryFieldOperators,
  ...dateTimeFieldOperators,
] as const;
type Operator = ValueOf<typeof operators>;

const numberOperatorsToSymbolMap: Record<NumberFieldOperator, string> = {
  '$eq': '\u003D',
  '$lt': '\u003C',
  '$lte': '\u2264',
  '$gt': '\u003E',
  '$gte': '\u2265',
  '$ne': '\u2260',
} as const;

const dateTimeFieldOperatorsToSymbolMap: Record<DateTimeFieldOperator, string> = {
  '$eq': '\u003D',
  '$lt': '\u003C',
  '$lte': '\u2264',
  '$gt': '\u003E',
  '$gte': '\u2265',
  '$ne': '\u2260',
  '$range': 'Range',
} as const;

const enumOperatorsToSymbolMap: Record<EnumFieldOperator, string> = {
  '$eq': 'is',
  '$ne': 'is not',
  '$in': 'is one of',
  '$nin': 'is none of',
};

const arrayOperatorsToSymbolMap: Record<ArrayFieldOperator, string> = {
  '$eq': 'is',
  '$ne': 'is not',
  '$any': 'contains any matching',
  '$all': 'contains all matching',
};

const getOperatorLabel = (operator: Operator, field: Field) => {
  let label = '';
  
  if (field.operatorInfo && operator in field.operatorInfo) {
    label = field.operatorInfo[operator]?.label ?? '';
  } else if (field.type === 'array') {
    if (operator in arrayOperatorsToSymbolMap) {
      label = arrayOperatorsToSymbolMap[operator as ArrayFieldOperator];
    }
  } else if (field.type === 'enum') {
    if (operator in enumOperatorsToSymbolMap) {
      label = enumOperatorsToSymbolMap[operator as EnumFieldOperator];
    }
  } else if (field.type === 'number') {
    if (operator in numberOperatorsToSymbolMap) {
      label = numberOperatorsToSymbolMap[operator as NumberFieldOperator];
    }
  } else if (field.type === 'datetime') {
    if (operator in dateTimeFieldOperatorsToSymbolMap) {
      label = dateTimeFieldOperatorsToSymbolMap[operator as DateTimeFieldOperator];
    }
  }

  return label;
};

// Field specification
type Alternative = { label: string };
type Alternatives = Record<string, Alternative>;
type OperatorInfo = Partial<Record<Operator, { label: string }>>;
export type TypeOfFieldSpec<S extends Field> =
  S extends { type: 'number' }
    ? number
    : S extends { type: 'text' }
      ? string
      : S extends { type: 'datetime' }
        ? Date
        : S extends { type: 'enum' }
          ? keyof S['alternatives']
          : S extends { type: 'array' }
            ? Array<TypeOfFieldSpec<S['subfield']>>
            : S extends { type: 'dictionary' }
              ? Record<string, string>
              : S extends { type: 'record' }
                ? TypeOfFieldsSpec<S['fields']>
                : never;
                
export type TypeOfFieldsSpec<S extends Fields> = {
  [fieldName in keyof S]: TypeOfFieldSpec<S[fieldName]>
};

type ValidatorResponse = {
  isValid: boolean,
  message: string,
};
export type DateTimeValidator = (param: {
  dateTime: Date,
  startDateTime: Date,
  endDateTime: Date
}) => ValidatorResponse;
export type TextValidator = (options: { buffer: string }) => ValidatorResponse;
export type ArrayValidator<Spec extends ArrayFieldSpec> =
  (options: { buffer: TypeOfFieldSpec<Spec> }) => ValidatorResponse;
export type EnumValidator<Spec extends EnumFieldSpec> =
  (options: { buffer: TypeOfFieldSpec<Spec> }) => ValidatorResponse;
export type DictionaryValidator = (options: { key: string, buffer: string }) => ValidatorResponse;

export type Accessor<R> = (item: any) => R;

export type EnumFieldSpec = {
  type: 'enum',
  label: React.ReactNode,
  operators: Array<EnumFieldOperator>,
  alternatives: Alternatives,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: EnumValidator<EnumFieldSpec>,
  accessor?: Accessor<string>,
};
export type ArrayFieldSpec = {
  type: 'array',
  label: React.ReactNode,
  operators: Array<ArrayFieldOperator>,
  subfield: EnumFieldSpec | NumberFieldSpec,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: ArrayValidator<ArrayFieldSpec>,
  accessor?: Accessor<string | number>,
};
export type TextFieldSpec = {
  type: 'text',
  label: React.ReactNode,
  operators: Array<TextFieldOperator>,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: TextValidator,
  accessor?: Accessor<string>,
};
export type NumberFieldSpec = {
  type: 'number',
  label: React.ReactNode,
  operators: Array<NumberFieldOperator>,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: TextValidator,
  accessor?: Accessor<number>,
};

type DateType = Date | number;
export type SelectedDate = DateType | [DateType, DateType];
export type OnAddFilter = (newFilter: FieldQuery, currentFilters: FilterQuery) => FilterQuery;

export type DateTimeFieldSpec = {
  type: 'datetime',
  label: React.ReactNode,
  operators: Array<DateTimeFieldOperator>,
  placeholder?: string,
  selectedDate?: SelectedDate,
  onAddFilter?: OnAddFilter,
  maxDate?: Date | number,
  minDate?: Date | number,
  operatorInfo?: OperatorInfo,
  validator?: DateTimeValidator,
  accessor?: Accessor<Date>,
};
type SuggestedKey = { label: string };
type SuggestedKeys = { [key: string]: SuggestedKey };
export type DictionaryFieldSpec = {
  type: 'dictionary',
  label: React.ReactNode,
  operators: Array<DictionaryFieldOperators>,
  suggestedKeys?: SuggestedKeys,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: DictionaryValidator,
  accessor?: Accessor<Record<string, string>>,
};
export type RecordFieldSpec = {
  type: 'record',
  label: React.ReactNode,
  operators: Array<RecordFieldOperators>,
  fields: Fields,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  validator?: DictionaryValidator,
  accessor?: Accessor<Record<string, unknown>>,
};

export type Field =
  | EnumFieldSpec
  | ArrayFieldSpec
  | TextFieldSpec
  | NumberFieldSpec
  | DateTimeFieldSpec
  | DictionaryFieldSpec
  | RecordFieldSpec;
export type Fields = Record<string, Field>;

type Primitive = null | string | number | bigint | boolean;
type RangeOperationValue = [start: number, end: number];
type QueryOperation =
  | { $eq: Primitive | Array<Primitive> }
  | { $ne: Primitive | Array<Primitive> }
  | { $in: Array<Primitive> }
  | { $nin: Array<Primitive> }
  | { $text: { $search: string } }
  | { $lt: number }
  | { $lte: number }
  | { $gt: number }
  | { $gte: number }
  | { $range: RangeOperationValue }
  | { $all: (
    // For dictionary type fields
    | { [key: string]: Primitive | QueryOperation }
    // For array type fields
    //| QueryOperation // Equivalent to `{ $and: [<op>] }`
    | { $or: Array<QueryOperation> }
    | { $and: Array<QueryOperation> }
  )}
  | { $any: (
    // For dictionary type fields
    | { [key: string]: Primitive | QueryOperation } // TODO: not yet implemented in the UI
    // For array type fields
    | { $or: Array<QueryOperation> }
    | { $and: Array<QueryOperation> }
  )};

type EnumFieldQueryOperation = Extract<QueryOperation, Partial<{ [K in EnumFieldOperator]: unknown }>>;
type ArrayFieldQueryOperation = Extract<QueryOperation, Partial<{ [K in ArrayFieldOperator]: unknown }>>;
type NumberFieldQueryOperation = Extract<QueryOperation, Partial<{ [K in NumberFieldOperator]: unknown }>>;
type DateTimeFieldQueryOperation = Extract<QueryOperation, Partial<{ [K in DateTimeFieldOperator]: unknown }>>;

type FieldName = string | null;
export type FieldQuery = { fieldName: FieldName, operation: QueryOperation };
export type FilterQuery = Array<FieldQuery>;

const isRangeOperationValue = (input: unknown): input is RangeOperationValue => {
  return Array.isArray(input) && input.length === 2 && typeof input[0] === 'number' && typeof input[1] === 'number';
};

const isValidOperator = (operator: Operator, type?: Field['type']) => {
  let isValid = false;

  switch (type) {
    case 'enum':
      isValid = (enumFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;
    
    case 'array':
      isValid = (arrayFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;

    case 'dictionary':
      isValid = (dictionaryFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;
    
    case 'number':
      isValid = (numberFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;
    
    case 'text':
      isValid = (textFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;
    
    case 'datetime':
      isValid = (dateTimeFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;

    default:
      isValid = (enumFieldOperators as ReadonlyArray<Operator>).includes(operator)
        || (textFieldOperators as ReadonlyArray<Operator>).includes(operator)
        || (numberFieldOperators as ReadonlyArray<Operator>).includes(operator);
      break;
  }

  return isValid;
};

const encodeEnumFieldQueryOperation = (
  operators: EnumFieldOperator[],
  value: Array<Primitive>,
  selectedOperator: EnumFieldOperator = '$in',
) => {
  if (value.length === 0) { return null; }
  
  let queryOperation: QueryOperation;
  
  if (operators.includes('$in') && selectedOperator === '$in') {
    queryOperation = { $in: value };
  } else if (operators.includes('$nin') && selectedOperator === '$nin') {
    queryOperation = { $nin: value };
  } else if (operators.includes('$ne') && selectedOperator === '$ne') {
    queryOperation = { $ne: value[0] };
  } else {
    // Default to $eq
    queryOperation = { $eq: value[0] };
  }
  
  return queryOperation;
};

const encodeArrayFieldQueryOperation = (
  operators: ArrayFieldOperator[],
  value: Array<Primitive> | Primitive,
  selectedOperator: ArrayFieldOperator,
  selectedSubOperator: EnumFieldOperator | NumberFieldOperator | null,
) => {
  if (Array.isArray(value) && value.length === 0) { return null; }
  
  let queryOperation: QueryOperation;
  
  if (operators.includes('$ne') && selectedOperator === '$ne') {
    queryOperation = { $ne: value };
  } else if (operators.includes('$any') && selectedOperator === '$any' && selectedSubOperator) {
    if (selectedSubOperator === '$in' && Array.isArray(value)) {
      queryOperation = { $any: { $or: value.map(v => ({ $eq: v })) } };
    } else if (selectedSubOperator === '$nin' && Array.isArray(value)) {
      queryOperation = { $any: { $and: value.map(v => ({ $ne: v })) } };
    } else if (numberFieldOperators.includes(selectedSubOperator as NumberFieldOperator) && typeof value === 'string') {
      // Remove comma and space from the value
      const valueAsNumber = parseFloat(value.trim().replace(/[ ,]+/g, ''));
      queryOperation = { $any: { [selectedSubOperator]: valueAsNumber } };
    } else {
      queryOperation = { $eq: value };
    }
  } else if (operators.includes('$all') && selectedOperator === '$all' && selectedSubOperator) {
    if (selectedSubOperator === '$in' && Array.isArray(value)) {
      queryOperation = { $all: { $or: value.map(v => ({ $eq: v })) } };
    } else if (selectedSubOperator === '$nin' && Array.isArray(value)) {
      queryOperation = { $all: { $and: value.map(v => ({ $ne: v })) } };
    } else if (numberFieldOperators.includes(selectedSubOperator as NumberFieldOperator) && typeof value === 'string') {
      // Remove comma and space from the value
      const valueAsNumber = parseFloat(value.trim().replace(/[ ,]+/g, ''));
      queryOperation = { $all: { [selectedSubOperator]: valueAsNumber } };
    } else {
      queryOperation = { $eq: value };
    }
  } else {
    // Default to $eq
    queryOperation = { $eq: value };
  }
  
  return queryOperation;
};

const encodeDictionaryFieldQueryOperation = (
  operators: DictionaryFieldOperators[],
  value: string = '',
  key: string,
): QueryOperation => {
  return { $all: { [key]: value } };
};

const encodeTextFieldQueryOperation = (
  operators: TextFieldOperator[],
  value = '',
) => {
  if (value.length === 0) { return null; }
  
  let queryOperation: QueryOperation;
  
  if (operators.includes('$text')) {
    queryOperation = { $text: { $search: value } };
  } else {
    // Default to $eq
    queryOperation = { $eq: value };
  }
  
  return queryOperation;
};

const encodeNumberFieldQueryOperation = (
  operators: NumberFieldOperator[],
  value: number,
  selectedOperator: NumberFieldOperator | null = null,
) => {
  let queryOperation: QueryOperation;
  
  if (selectedOperator === '$lt') {
    queryOperation = { $lt: value };
  } else if (selectedOperator === '$lte') {
    queryOperation = { $lte: value };
  } else if (selectedOperator === '$gt') {
    queryOperation = { $gt: value };
  } else if (selectedOperator === '$gte') {
    queryOperation = { $gte: value };
  } else if (selectedOperator === '$ne') {
    queryOperation = { $ne: value };
  } else {
    // Default to $eq
    queryOperation = { $eq: value };
  }
  
  return queryOperation;
};

const encodeDateTimeFieldQueryOperation = (
  operators: DateTimeFieldOperator[],
  value: number | RangeOperationValue,
  selectedOperator: DateTimeFieldOperator | null = null,
) => {
  let queryOperation: QueryOperation;
  
  if (isRangeOperationValue(value)) {
    if (!value[0] || !value[1]) {
      return null;
    }
    if (operators.includes('$range')) {
      queryOperation = { $range: value };
    } else {
      return null;
    }
  } else if (selectedOperator === '$lt') {
    queryOperation = { $lt: value };
  } else if (selectedOperator === '$lte') {
    queryOperation = { $lte: value };
  } else if (selectedOperator === '$gt') {
    queryOperation = { $gt: value };
  } else if (selectedOperator === '$gte') {
    queryOperation = { $gte: value };
  } else if (selectedOperator === '$ne') {
    queryOperation = { $ne: value };
  } else {
    // Default to $eq
    queryOperation = { $eq: value };
  }

  return queryOperation;
};

export const encodeFieldQuery = (
  fieldName: FieldName,
  value: Primitive | Array<Primitive>,
  selectedOperator: Operator | null = null,
  selectedSubOperator: Operator | null = null,
  fields?: Fields,
  key?: string,
): FieldQuery | null => {
  let operation: QueryOperation | null = null;
  const field = fieldName ? fields?.[fieldName] : null;
  
  if (selectedOperator && !isValidOperator(selectedOperator, field?.type)) { return null; }
  
  if (field?.type === 'enum' && Array.isArray(value)) {
    operation = encodeEnumFieldQueryOperation(
      field.operators,
      value,
      selectedOperator as EnumFieldOperator,
    );
  } else if (field?.type === 'array') {
    operation = encodeArrayFieldQueryOperation(
      field.operators,
      value,
      selectedOperator as ArrayFieldOperator,
      selectedSubOperator as NumberFieldOperator | EnumFieldOperator,
    );
  } else if (field?.type === 'dictionary' && typeof value === 'string' && typeof key === 'string') {
    operation = encodeDictionaryFieldQueryOperation(
      field.operators,
      value,
      key,
    );
  } else if (field?.type === 'text' && typeof value === 'string') {
    operation = encodeTextFieldQueryOperation(
      field.operators,
      value.trim(),
    );
  } else if (field?.type === 'number' && typeof value === 'string') {
    // Remove comma and space from the value
    const valueAsNumber = parseFloat(value.trim().replace(/[ ,]+/g, ''));
    
    if (!Number.isNaN(valueAsNumber) && Number.isFinite(valueAsNumber)) {
      operation = encodeNumberFieldQueryOperation(
        field.operators,
        valueAsNumber,
        selectedOperator as NumberFieldOperator,
      );
    }
  } else if (field?.type === 'datetime' && (typeof value === 'number' || isRangeOperationValue(value))) {
    operation = encodeDateTimeFieldQueryOperation(
      field.operators,
      value as number | RangeOperationValue,
      selectedOperator as DateTimeFieldOperator,
    );
  } else if (field === null && typeof value === 'string') {
    operation = encodeTextFieldQueryOperation(
      ['$text'],
      value.trim(),
    );
  }

  if (!operation) { return null; }

  return { fieldName, operation };
};

const decodeEnumFieldQuery = (fieldQuery: FieldQuery) => {
  const operation = fieldQuery.operation as EnumFieldQueryOperation;
  const operator = Object.keys(operation)[0] as EnumFieldOperator;
  const operatorSymbol = enumOperatorsToSymbolMap[operator];

  const operand = Object.values(fieldQuery.operation)[0];
  
  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
  };
};

const decodeArrayFieldQuery = (fieldQuery: FieldQuery, field: ArrayFieldSpec) => {
  const operation = fieldQuery.operation as ArrayFieldQueryOperation;
  const operator = Object.keys(operation)[0] as ArrayFieldOperator;
  const operatorSymbol = getOperatorLabel(operator, field);
  let subOperatorSymbol = '';

  let operand = [];

  if (operator === '$any' && '$any' in operation) {
    if ('$or' in operation.$any && Array.isArray(operation.$any.$or)) {
      operand = operation.$any.$or.map(value => {
        if (typeof value !== 'object' || !value) {
          return value;
        }

        if ('$eq' in value) {
          subOperatorSymbol = getOperatorLabel('$in', field.subfield);
          return value.$eq;
        } else {
          return value;
        }
      });
    } else if ('$and' in operation.$any && Array.isArray(operation.$any.$and)) {
      operand = operation.$any.$and.map(value => {
        if (typeof value !== 'object' || !value) {
          return value;
        }

        if ('$ne' in value) {
          subOperatorSymbol = getOperatorLabel('$nin', field.subfield);
          return value.$ne;
        } else {
          return value;
        }
      });
    } else if (Object.keys(operation.$any)[0]) {
      const subOperator = Object.keys(operation.$any)[0];

      if (numberFieldOperators.includes(subOperator as NumberFieldOperator)) {
        subOperatorSymbol = getOperatorLabel(subOperator as Operator, field.subfield);
        operand = Object.values(operation.$any)[0];
      }
    }
  } else if (operator === '$all' && '$all' in operation) {
    if ('$or' in operation.$all && Array.isArray(operation.$all.$or)) {
      operand = operation.$all.$or.map(value => {
        if (typeof value !== 'object' || !value) {
          return value;
        }

        if ('$eq' in value) {
          subOperatorSymbol = getOperatorLabel('$in', field.subfield);
          return value.$eq;
        } else {
          return value;
        }
      });
    } else if ('$and' in operation.$all && Array.isArray(operation.$all.$and)) {
      operand = operation.$all.$and.map(value => {
        if (typeof value !== 'object' || !value) {
          return value;
        }

        if ('$ne' in value) {
          subOperatorSymbol = getOperatorLabel('$nin', field.subfield);
          return value.$ne;
        } else {
          return value;
        }
      });
    } else if (Object.keys(operation.$all)[0]) {
      const subOperator = Object.keys(operation.$all)[0];

      if (numberFieldOperators.includes(subOperator as NumberFieldOperator)) {
        subOperatorSymbol = getOperatorLabel(subOperator as Operator, field.subfield);
        operand = Object.values(operation.$all)[0];
      }
    }
  } else {
    operand = Object.values(fieldQuery.operation)[0];
  }
  
  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
    subOperatorSymbol,
  };
};

const decodeNumberFieldQuery = (fieldQuery: FieldQuery) => {
  const operation = fieldQuery.operation as NumberFieldQueryOperation;
  const operator = Object.keys(operation)[0] as NumberFieldOperator;
  const operatorSymbol = numberOperatorsToSymbolMap[operator];

  const operand = Object.values(fieldQuery.operation)[0];
  
  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
  };
};

const decodeDateTimeFieldQuery = (fieldQuery: FieldQuery) => {
  const operation = fieldQuery.operation as DateTimeFieldQueryOperation;
  const operator = Object.keys(operation)[0] as DateTimeFieldOperator;
  const operatorSymbol = dateTimeFieldOperatorsToSymbolMap[operator];

  const operand = Object.values(fieldQuery.operation)[0];
  
  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
  };
};

const decodeFieldQuery = (fieldQuery: FieldQuery, fields: Fields): {
  fieldName: FieldName,
  operator: Operator,
  operatorSymbol: string,
  operand: any,
  subOperatorSymbol?: string,
} => {
  const field = fieldQuery.fieldName ? fields[fieldQuery.fieldName] : null;
  const fieldType = fieldQuery.fieldName ? fields[fieldQuery.fieldName].type : null;

  if (fieldType === 'enum') {
    return decodeEnumFieldQuery(fieldQuery);
  } else if (field && field.type === 'array') {
    return decodeArrayFieldQuery(fieldQuery, field);
  } else if (fieldType === 'number') {
    return decodeNumberFieldQuery(fieldQuery);
  } else if (fieldType === 'datetime') {
    return decodeDateTimeFieldQuery(fieldQuery);
  }

  const operator = Object.keys(fieldQuery.operation)[0] as Operator;
  const operatorSymbol = ':';
  const operationValue = Object.values(fieldQuery.operation)[0];
  const operand = operator === '$text' ? operationValue?.$search || '' : operationValue;
  
  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
  };
};

type UseFiltersProps = {
  fields?: Fields,
  customFilters?: FilterQuery,
  query?: (filters: FilterQuery) => void;
};
export const useFilters = (props: UseFiltersProps) => {
  const {
    fields,
    customFilters,
    query,
  } = props;
  
  const [filters, setFilters] = React.useState<FilterQuery>([]);
  
  React.useEffect(() => {
    setFilters(customFilters ?? []);
  }, [customFilters]);

  const addFilter = (options: {
    fieldName: FieldName,
    value: Primitive | Array<Primitive>,
    selectedOperator?: Operator | null,
    selectedSubOperator?: Operator | null,
    key?: string,
  }) => {
    const {
      fieldName,
      value,
      selectedOperator = null,
      selectedSubOperator = null,
      key = '',
    } = options;

    const fieldQuery = encodeFieldQuery(fieldName, value, selectedOperator, selectedSubOperator, fields, key);
    
    if (fieldName && fields && typeof fields[fieldName]?.onAddFilter === 'function') {
      const field = fields[fieldName];
      const updatedFilters = field.onAddFilter(fieldQuery, filters);
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
  fields: Fields,
  filters?: FilterQuery,
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

  const renderDateTimeFilter = (filter: FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand } = decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;
    const fieldNameLabel = typeof field?.label === 'string' ? field?.label : '';
    let symbol = ':';

    if (field && operatorSymbol && field.type === 'datetime') {
      if (operatorSymbol === 'Range') {
        symbol = '';
      } else {
        symbol = ` ${operatorSymbol}`;
      }
    }

    let operandLabel: { from: string, to: string } | string = '';

    if (field && field.type === 'datetime') {
      if (operatorSymbol === 'Range') {
        if (isRangeOperationValue(operand)) {
          const startDateTime = dateFormat(operand[0] * 1000, 'MMMM do yyyy HH:mm');
          const endDateTime = dateFormat(operand[1] * 1000, 'MMMM do yyyy HH:mm');
          operandLabel = { from: startDateTime, to: endDateTime };
        }
      } else {
        const dateTime = dateFormat(operand * 1000, 'MMMM do yyyy HH:mm');
        operandLabel = dateTime;
      }
    }

    return (
      <Tag
        key={Random.generateRandomId()}
        className="bkl-multi-search__filter"
        onClose={() => { onRemoveFilter?.(index); }}
        primary
        small
      >
        {fieldNameLabel
          ? (
            <>
              <span>{`${fieldNameLabel}${symbol}`} </span>
              {typeof operandLabel === 'string'
                ? <span className="filter-value">{operandLabel}</span>
                : (
                  <>
                    <span className="filter-operand">from</span>
                    <span className="filter-value">{operandLabel.from}</span>
                    <span className="filter-operand">to</span>
                    <span className="filter-value">{operandLabel.to}</span>
                  </>
                )
              }
            </>
          ) : `${operandLabel}`
        }
      </Tag>
    );
  };
 
  const renderArrayFilter = (filter: FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand, subOperatorSymbol = '' } = decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;
    const subField = field && field.type === 'array' ? field.subfield : null;
    const fieldNameLabel = typeof field?.label === 'string' ? field?.label : '';
    let symbol = ':';

    if (field && operatorSymbol && field.type === 'array') {
      symbol = ` ${operatorSymbol} ${subOperatorSymbol}`;
    }

    let operandLabel: string = '';

    if (subField) {
      if (subField.type === 'enum') {
        if (Array.isArray(operand)) {
          operandLabel = operand.map(o => subField?.alternatives[o]?.label || o).join(', ');
        } else {
          operandLabel = subField?.alternatives[operand]?.label || operand;
        }
      } else if (subField.type === 'number') {
        operandLabel = operand;
      }
    }

    return (
      <Tag
        key={Random.generateRandomId()}
        className="bkl-multi-search__filter"
        onClose={() => { onRemoveFilter?.(index); }}
        primary
        small
      >
        {fieldNameLabel
          ? (
            <>
              <span>{`${fieldNameLabel}${symbol}`} </span>
              <span className="filter-value">{operandLabel}</span>
            </>
          ) : `${operandLabel}`
        }
      </Tag>
    );
  };

  const renderFilter = (filter: FieldQuery, index: number) => {
    const { fieldName, operatorSymbol, operand } = decodeFieldQuery(filter, fields);
    const field = fieldName ? fields[fieldName] : null;

    if (field) {
      if (field.type === 'datetime') {
        return renderDateTimeFilter(filter, index);
      } else if (field.type === 'array') {
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
    
    let operandLabel;
    
    if (field && field.type === 'enum') {
      if (Array.isArray(operand)) {
        operandLabel = operand.map(o => field?.alternatives[o]?.label || o).join(', ');
      } else {
        operandLabel = field?.alternatives[operand]?.label || operand;
      }
    } else if (field && field.type === 'dictionary') {
      operandLabel = Object.keys(operand).map(key => {
        const keyLabel = field.suggestedKeys?.[key]?.label ?? key;

        return `${keyLabel} = ${operand[key]}`;
      }).join(', ');
    } else {
      operandLabel = operand;
    }
    
    return (
      <Tag
        key={Random.generateRandomId()}
        className="bkl-multi-search__filter"
        onClose={() => { onRemoveFilter?.(index); }}
        primary
        small
      >
        {fieldNameLabel
          ? (
            <>
              <span>{`${fieldNameLabel}${symbol}`} </span>
              <span className="filter-value">{operandLabel}</span>
            </>
          ) : `${operandLabel}`
        }
      </Tag>
    );
  };

  const renderActions = () => {
    return filters.length > 0 && (
      <div className="bkl-multi-search__filter-actions">
        <span
          role="button"
          tabIndex={0}
          className="clear-all"
          onKeyPress={onRemoveAllFilters}
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
    <div className="bkl-multi-search__filters">
      <div className="bkl-multi-search__filters-wrapper">
        {filters.map(renderFilter)}
      </div>
      {renderActions()}
    </div>
  );
};

type MultiSearchInputProps = ComponentPropsWithoutRef<typeof Input> & {
  fields: Fields,
  fieldQueryBuffer: FieldQueryBuffer,
  inputRef: React.RefObject<HTMLInputElement>,
};
export const SearchInput = React.forwardRef<HTMLInputElement, MultiSearchInputProps>((props, ref) => {
  const {
    className,
    onKeyDown,
    fields,
    fieldQueryBuffer,
    inputRef,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  
  const combinedRefs = useCombinedRefs(ref, inputRef);
  
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
      role="button"
      tabIndex={0}
      className={cx('bkl-search-input', className, { 'bkl-search-input--active': isFocused })}
      onClick={onWrapperClick}
      onKeyDown={onWrapperKeyDown}
    >
      <BaklavaIcon icon="search" className="bkl-search-input__search-icon"/>
      {field &&
        <span className="bkl-search-input__search-key">
          {field.label}{operator}{subOperator} {key ? `${key} =` : ''}
        </span>
      }
      <Input
        ref={combinedRefs}
        placeholder={renderPlaceholder()}
        className="bkl-search-input__input"
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...restProps}
      />
    </div>
  );
});

type FieldsDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement>,
  isActive?: boolean,
  fields?: Fields,
  popperOptions?: Dropdown.PopperOptions,
  onClick: (fieldName?: string) => void,
  onOutsideClick?: () => void,
};

const FieldsDropdown = (props: FieldsDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    fields,
    popperOptions,
    onClick,
    onOutsideClick,
  } = props;

  if (typeof fields === 'undefined') {
    return null;
  }

  return (
    <Suggestions
      active={isActive}
      popperOptions={popperOptions}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      basic
    >
      {Object.entries(fields || {}).map(([fieldName, { label }]) => (
        <SuggestionItem key={fieldName} value={fieldName} onActivate={onClick}>
          {label}
        </SuggestionItem>
      ))}
    </Suggestions>
  );
};

type AlternativesDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement>,
  isActive?: boolean,
  operators?: EnumFieldOperator[] | ArrayFieldOperator[],
  alternatives?: Alternatives,
  popperOptions?: Dropdown.PopperOptions,
  selectedOperator: Operator,
  onChange: (value: Primitive[]) => void,
  onOutsideClick?: () => void,
  validator?: ArrayValidator<ArrayFieldSpec>,
};

const AlternativesDropdown = (props: AlternativesDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    operators,
    alternatives,
    popperOptions,
    onChange,
    onOutsideClick,
    selectedOperator,
    validator,
  } = props;

  const [selectedAlternatives, setSelectedAlternatives] = React.useState<string[]>([]);

  const canSelectMultipleItems = ['$in', '$nin', '$any', '$all'].includes(selectedOperator);

  const onOptionClick = (key?: string) => {
    if (typeof key !== 'undefined') {
      onChange([key]);
    }
  };

  const ValidateSelection = () => {
    let isValid = false;
    let message = '';
    if (selectedAlternatives.length > 0) {
      isValid = true;
    }
    if (typeof validator === 'function' && selectedAlternatives.length > 0) {
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

  const onSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const checked = target.checked;
    const value = target.value;
    if (checked) {
      setSelectedAlternatives([...selectedAlternatives, value]);
    } else {
      setSelectedAlternatives([...selectedAlternatives.filter(item => item !== value)]);
    }
  };

  const renderMultiSelectAlternatives = () => (
    <>
      <Checkbox.Group
        className="bkl-multi-search__alternatives-group"
        selectedValues={selectedAlternatives}
        primary
      >
        {Object.entries(alternatives || {}).map(([alternativesName, { label }]) => (
          <Checkbox.Item
            key={alternativesName}
            label={label}
            value={alternativesName}
            className="bkl-dropdown__menu-item"
            onChange={onSelectionChange}
          />
        ))}
      </Checkbox.Group>
      <>
        {!arrayValidation.isValid && arrayValidation.message && (
          <Caption className="bkl-multi-search__dropdown-error-msg">
            {arrayValidation.message}
          </Caption>
        )}
      </>
      <div className="bkl-multi-search__alternatives-action">
        <Button
          onClick={onSelectionComplete}
          primary
          disabled={!arrayValidation.isValid}
        >
          Done
        </Button>
      </div>
    </>
  );

  const renderAlternatives = () => (
    Object.entries(alternatives || {}).map(([alternativesName, { label }]) => (
      <SuggestionItem key={alternativesName} value={alternativesName} onActivate={onOptionClick}>
        {label}
      </SuggestionItem>
    ))
  );

  return (
    <Suggestions
      className="bkl-multi-search__alternatives"
      active={isActive}
      popperOptions={popperOptions}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      basic
    >
      {canSelectMultipleItems ? renderMultiSelectAlternatives() : renderAlternatives()}
    </Suggestions>
  );
};

type DateTimeDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement>,
  isActive?: boolean,
  popperOptions?: Dropdown.PopperOptions,
  onChange: (value: number | [number, number]) => void,
  onOutsideClick?: () => void,
  maxDate?: Date | number,
  minDate?: Date | number,
  selectedDate?: SelectedDate,
  canSelectDateTimeRange?: boolean,
  validator?: DateTimeValidator,
};

const DateTimeDropdown = (props: DateTimeDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    popperOptions,
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

  const isValidSelectedDate = (selectedDate: SelectedDate | undefined) => {
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

  const initDateTime = (selectedDate: SelectedDate | undefined, range: 'start' | 'end') => {
    const defaultDate = setDate(new Date(), { seconds: 0, milliseconds: 0 });
    if (!selectedDate) {
      return defaultDate;
    }

    let date = defaultDate;

    if (isValidDateParamType(selectedDate)) {
      date = getDateObject(selectedDate as number | Date);
    } else if (isValidSelectedDate(selectedDate)) {
      if (range === 'start') {
        date = getDateObject(selectedDate?.[0]);
      } else if (range === 'end') {
        date = getDateObject(selectedDate?.[1]);
      }
    }

    return date;
  };

  const [dateTime, setDateTime] = React.useState(initDateTime(selectedDate, 'start'));
  const [startDateTime, setStartDateTime] = React.useState(initDateTime(selectedDate, 'start'));
  const [endDateTime, setEndDateTime] = React.useState(initDateTime(selectedDate, 'end'));

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
      <div className="bkl-multi-search__date-time-group">
        <div className="bkl-multi-search__date-time-label"><span>Start Date</span></div>
        <DateTimePicker
          dateTime={startDateTime}
          onChange={setStartDateTime}
          minDate={minDate ? new Date(minDate) : undefined}
          maxDate={maxDate ? new Date(maxDate) : undefined}
          dropdownReference={dateTimeMeridiemRef}
        />
      </div>

      <div className="bkl-multi-search__date-time-group">
        <div className="bkl-multi-search__date-time-label"><span>End Date</span></div>
        <DateTimePicker
          dateTime={endDateTime}
          onChange={setEndDateTime}
          minDate={minDate ? new Date(minDate) : undefined}
          maxDate={maxDate ? new Date(maxDate) : undefined}
          dropdownReference={dateTimeMeridiemRef}
        />
      </div>
    
      <>
        {!dateTimeRangeValidation.isValid
          && dateTimeRangeValidation.message
          && (
            <Caption className="bkl-multi-search__dropdown-error-msg">
              {dateTimeRangeValidation.message}
            </Caption>
          )
        }
      </>
        
      <div className="bkl-multi-search__date-time-action">
        <Button
          primary
          onClick={onSelectionComplete}
          disabled={!dateTimeRangeValidation.isValid}
        >
          Done
        </Button>
      </div>
    </>
  );

  const renderDateTimePicker = () => (
    <>
      <div className="bkl-multi-search__date-time-group">
        <DateTimePicker
          dateTime={dateTime}
          onChange={setDateTime}
          minDate={minDate ? new Date(minDate) : undefined}
          maxDate={maxDate ? new Date(maxDate) : undefined}
          dropdownReference={dateTimeMeridiemRef}
        />
      </div>

      <div className="bkl-multi-search__date-time-action">
        <Button
          onClick={onSelectionComplete}
          disabled={!dateTimeRangeValidation.isValid}
          primary
        >
          Done
        </Button>
      </div>
    </>
  );

  return (
    <Suggestions
      className="bkl-multi-search__date-time"
      active={isActive}
      popperOptions={popperOptions}
      elementRef={inputRef}
      containerRef={dateTimeMeridiemRef}
      onOutsideClick={onOutsideClick}
      basic
    >
      {canSelectDateTimeRange ? renderDateTimeRangePicker() : renderDateTimePicker()}
    </Suggestions>
  );
};

type SuggestedKeysDropdownProps = {
  inputRef?: React.RefObject<HTMLInputElement>,
  isActive?: boolean,
  operators?: DictionaryFieldOperators[],
  suggestedKeys?: SuggestedKeys,
  popperOptions?: Dropdown.PopperOptions,
  onChange: (value: string) => void,
  onOutsideClick?: () => void,
};

const SuggestedKeysDropdown = (props: SuggestedKeysDropdownProps) => {
  const {
    inputRef,
    isActive = false,
    operators,
    suggestedKeys,
    popperOptions,
    onChange,
    onOutsideClick,
  } = props;

  const [suggestedKeyValue, setSuggestedKeyValue] = React.useState('');

  const onOptionClick = (key?: string) => {
    if (typeof key !== 'undefined') {
      onChange(key);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.target.value;
    setSuggestedKeyValue(key);
  };

  const onInputKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' && suggestedKeyValue !== '') {
      onChange(suggestedKeyValue);
      setSuggestedKeyValue('');
    }
  };

  const renderSuggestedKeys = () => (
    Object.entries(suggestedKeys || {}).map(([suggestedKey, { label }]) => (
      <SuggestionItem key={suggestedKey} value={suggestedKey} onActivate={onOptionClick}>
        {label}
      </SuggestionItem>
    ))
  );

  const renderSuggestedKeyInput = () => (
    <Input
      className="bkl-dropdown__menu-item bkl-multi-search__suggested-key-input"
      placeholder="Enter a custom key"
      value={suggestedKeyValue}
      onChange={onInputChange}
      onKeyDown={onInputKeyDown}
    />
  );

  return (
    <Suggestions
      className="bkl-multi-search__suggested-keys"
      active={isActive}
      popperOptions={popperOptions}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      basic
    >
      {renderSuggestedKeys()}
      {renderSuggestedKeyInput()}
    </Suggestions>
  );
};

type OperatorsDropdownProps = {
  type: Field['type'],
  inputRef: React.RefObject<HTMLInputElement>,
  isActive: boolean,
  operators: Array<NumberFieldOperator | DateTimeFieldOperator | EnumFieldOperator | ArrayFieldOperator>,
  popperOptions?: Dropdown.PopperOptions,
  onClick: (key?: NumberFieldOperator | DateTimeFieldOperator | EnumFieldOperator | ArrayFieldOperator) => void,
  onOutsideClick?: () => void,
  operatorInfo?: OperatorInfo,
};

const OperatorsDropdown = (props: OperatorsDropdownProps) => {
  const {
    type,
    inputRef,
    isActive = false,
    operators,
    popperOptions,
    onClick,
    onOutsideClick,
    operatorInfo = {},
  } = props;

  if (operators.length === 0) { return null; }

  let symbolMap = {};

  if (type === 'enum') {
    symbolMap = enumOperatorsToSymbolMap;
  } else if (type === 'array') {
    symbolMap = arrayOperatorsToSymbolMap;
  } else if (type === 'number') {
    symbolMap = numberOperatorsToSymbolMap;
  } else if (type === 'datetime') {
    symbolMap = dateTimeFieldOperatorsToSymbolMap;
  }

  symbolMap = ObjectUtil.map(symbolMap, (label, operator) => {
    return operator in operatorInfo
      ? operatorInfo[operator as Operator]?.label
      : label;
  });

  return (
    <Suggestions
      className="bkl-multi-search__operators"
      active={isActive}
      popperOptions={popperOptions}
      elementRef={inputRef}
      onOutsideClick={onOutsideClick}
      basic
    >
      {ObjectUtil.entries(symbolMap)
        .filter(entry => operators.includes(entry[0]))
        .map(([operator, operatorSymbol]) => (
          <SuggestionItem className="operator" key={operator} value={operator} onActivate={onClick}>
            {operatorSymbol}
          </SuggestionItem>
        ))
      }
    </Suggestions>
  );
};

type FieldQueryBuffer = {
  fieldName: FieldName,
  operator: Operator | null,
  subOperator: Operator | null,
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

export type MultiSearchProps = Omit<ComponentPropsWithoutRef<'input'>, 'className'|'children'> & {
  className?: ClassNameArgument,
  fields: Fields,
  popperOptions?: Dropdown.PopperOptions,
  query?: (filters: FilterQuery) => void;
  filters?: FilterQuery,
};
export const MultiSearch = (props: MultiSearchProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const {
    className,
    fields,
    popperOptions: customPopperOptions,
    query,
    onFocus,
    onClick,
    disabled,
    filters: customFilters,
  } = props;
  
  const { filters, addFilter, removeFilter, removeAllFilters } = useFilters({
    fields,
    customFilters,
    query,
  });
  const [fieldQueryBuffer, setFieldQueryBuffer] = React.useState<FieldQueryBuffer>(initializeFieldQueryBuffer);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [validatorResponse, setValidatorResponse] = React.useState({ isValid: true, message: '' });

  const popperOptions: Dropdown.PopperOptions = {
    placement: 'bottom-start',
    ...(customPopperOptions ?? {}),
  };
  
  const updateFieldQueryBuffer = (newFieldQuery: FieldQueryBuffer) => {
    setFieldQueryBuffer(newFieldQuery);
  };
  
  const validateFieldQuery = (fieldQueryBuffer: FieldQueryBuffer): ValidatorResponse => {
    let isValid = fieldQueryBuffer.value?.trim() !== '';
    let message = '';

    if (fieldQueryBuffer.fieldName) {
      const field: Field = fields[fieldQueryBuffer.fieldName];
      if (field.type === 'text') {
        const searchInputValidator = field.validator as TextValidator;
        if (isValid && typeof searchInputValidator === 'function') {
          const validatorResponse = searchInputValidator({ buffer: fieldQueryBuffer.value });
          isValid = validatorResponse.isValid;
          message = validatorResponse.message;
        }
      } else if (field.type === 'number') {
        const searchInputValidator = field.validator as TextValidator;
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
        const searchInputValidator = field.validator as ArrayValidator<ArrayFieldSpec>;
        if (isValid) {
          if (field.subfield && field.subfield.type === 'enum') {
            isValid = Object.values(field.subfield.alternatives).filter(alternative =>
              alternative.label.toLowerCase() === fieldQueryBuffer.value.toLowerCase()).length > 0;
            if (!isValid) {
              message = 'Please enter a valid value';
            }
          } else if (typeof searchInputValidator === 'function') {
            const validatorResponse = searchInputValidator({ buffer: fieldQueryBuffer.value });
            isValid = validatorResponse.isValid;
            message = validatorResponse.message;
          }
        }
      } else if (field.type === 'enum') {
        const searchInputValidator = field.validator as EnumValidator<EnumFieldSpec>;
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
        const searchInputValidator = field.validator as DictionaryValidator;
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
        const searchInputValidator = field.validator as DateTimeValidator;
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
        if (fieldQueryBuffer && fieldQueryBuffer.fieldName) {
          const field: Field = fields[fieldQueryBuffer.fieldName];
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
      } else if (fieldQueryBuffer.subOperator && operators.includes(fieldQueryBuffer.subOperator)) {
        updateFieldQueryBuffer({ ...fieldQueryBuffer, subOperator: null });
      } else if (fieldQueryBuffer.operator && operators.includes(fieldQueryBuffer.operator)) {
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
    setIsInputFocused(false);
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
      
      const newFieldQuery: FieldQueryBuffer = {
        ...fieldQueryBuffer,
        fieldName,
      };

      if (['number', 'datetime', 'enum', 'array'].includes(field.type) && field.operators.length === 1) {
        newFieldQuery.operator = field.operators[0];
      }

      if (field.type === 'array' && field.subfield.operators.length === 1) {
        newFieldQuery.subOperator = field.subfield.operators[0];
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
        popperOptions={popperOptions}
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

    let operators: Array<EnumFieldOperator> | Array<ArrayFieldOperator> = [];

    if (field.operators) {
      operators = field.operators as Array<EnumFieldOperator> | Array<ArrayFieldOperator>;
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
        operators={operators}
        alternatives={alternatives}
        popperOptions={popperOptions}
        onChange={onAlternativesChange}
        onOutsideClick={onOutsideClick}
        selectedOperator={field.type === 'array' ? '$any' : operator}
        validator={field.validator as ArrayValidator<ArrayFieldSpec>}
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
        popperOptions={popperOptions}
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
        popperOptions={popperOptions}
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
      operator?: NumberFieldOperator | DateTimeFieldOperator | EnumFieldOperator | ArrayFieldOperator,
    ) => {
      if (typeof operator === 'undefined') { return; }

      const newFieldQuery = { ...fieldQueryBuffer, operator };
      
      if (field.type === 'array' && field.subfield.operators.length === 1) {
        newFieldQuery.subOperator = field.subfield.operators[0];
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
        popperOptions={popperOptions}
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

    const operatorTypes = ['array'];

    if (!field || field.type !== 'array') { return null; }
    
    const subOperatorTypes = ['enum', 'number'];
    const subField = field.subfield;

    if (!subField || (subField.type !== 'number' && subField.type !== 'enum')
    ) {
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
      subOperator?: NumberFieldOperator | DateTimeFieldOperator | EnumFieldOperator | ArrayFieldOperator,
    ) => {
      if (typeof subOperator === 'undefined') { return; }
      
      updateFieldQueryBuffer({ ...fieldQueryBuffer, subOperator });
      
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
        popperOptions={popperOptions}
        onClick={onOperatorClick}
        onOutsideClick={onOutsideClick}
        operatorInfo={field.subfield.operatorInfo}
      />
    );
  };
  
  return (
    <div className={cx('bkl-multi-search', className)}>
      {renderSearchInput()}
      {renderFieldsDropdown()}
      {renderAlternativesDropdown()}
      {renderDateTimeSelectorDropdown()}
      {renderSuggestedKeysDropdown()}
      {renderOperatorsDropdown()}
      {renderSubOperatorsDropdown()}
      {!validatorResponse.isValid && validatorResponse.message && (
        <Caption className="bkl-multi-search__error-msg">
          {validatorResponse.message}
        </Caption>
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
MultiSearch.displayName = 'MultiSearch';
