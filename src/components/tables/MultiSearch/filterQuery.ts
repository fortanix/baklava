/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//
// This module contains definitions for the filter query language used to express filtering in
// data tables. These filters can be sent to a backend API to filter the result set.
//

// Utilities
type ValueOf<T extends ReadonlyArray<unknown>> = T[number];

const uniq = <T>(arr: Array<T>): Array<T> => [...new Set(arr)];


// Operators
export const enumFieldOperators = ['$in', '$nin', '$eq', '$ne'] as const;
export type EnumFieldOperator = ValueOf<typeof enumFieldOperators>;

export const arrayFieldOperators = ['$eq', '$ne', '$all', '$any'] as const;
export type ArrayFieldOperator = ValueOf<typeof arrayFieldOperators>;

export const textFieldOperators = ['$eq', '$text'] as const;
export type TextFieldOperator = ValueOf<typeof textFieldOperators>;

export const numberFieldOperators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne'] as const;
export type NumberFieldOperator = ValueOf<typeof numberFieldOperators>;

export const dictionaryFieldOperators = ['$all'] as const;
export type DictionaryFieldOperators = ValueOf<typeof dictionaryFieldOperators>;

export const recordFieldOperators = ['$all', '$any'] as const;
export type RecordFieldOperators = ValueOf<typeof recordFieldOperators>;

export const dateTimeFieldOperators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$range'] as const;
export type DateTimeFieldOperator = ValueOf<typeof dateTimeFieldOperators>;

export const operators = uniq([
  ...enumFieldOperators,
  ...arrayFieldOperators,
  ...textFieldOperators,
  ...numberFieldOperators,
  ...dictionaryFieldOperators,
  ...dateTimeFieldOperators,
] as const);
export type Operator = ValueOf<typeof operators>;

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

export type FieldName = string | null;
export type FieldQuery = { fieldName: FieldName, operation: QueryOperation };
export type FilterQuery = Array<FieldQuery>;

export const createFilterQuery = (): FilterQuery => [];

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
      const valueAsNumber = Number.parseFloat(value.trim().replace(/[ ,]+/g, ''));
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
      const valueAsNumber = Number.parseFloat(value.trim().replace(/[ ,]+/g, ''));
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
  value = '',
  key = '',
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
    const valueAsNumber = Number.parseFloat(value.trim().replace(/[ ,]+/g, ''));
    
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
