/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//
// This module contains definitions for the filter query language used to express filtering in
// data tables. These filters can be sent to a backend API to filter the result set.
//

// Utilities
type ValueOf<T extends ReadonlyArray<unknown>> = T[number];

const uniq = <T>(arr: ReadonlyArray<T>): Array<T> => [...new Set(arr)];


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

// A union of all operators
export type Operator =
  | EnumFieldOperator
  | ArrayFieldOperator
  | TextFieldOperator
  | NumberFieldOperator
  | DictionaryFieldOperators
  | RecordFieldOperators
  | DateTimeFieldOperator;

export const operators: Operator[] = uniq([
  ...enumFieldOperators,
  ...arrayFieldOperators,
  ...textFieldOperators,
  ...numberFieldOperators,
  ...dictionaryFieldOperators,
  ...dateTimeFieldOperators,
] as const);

// Field specification
export type Alternative = { label: string };
export type Alternatives = Record<string, Alternative>;
export type OperatorInfo = Partial<Record<Operator, { label: string }>>;
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

export type ValidatorResponse = {
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

export type Accessor<R> = (item: unknown) => R;

type BaseFieldSpec = {
  label: string,
  placeholder?: string,
  operatorInfo?: OperatorInfo,
  onAddFilter?: OnAddFilter,
  accessor?: Accessor<unknown>,
}

export type EnumFieldSpec = BaseFieldSpec & {
  type: 'enum',
  operators: Array<EnumFieldOperator>,
  alternatives: Alternatives,
  validator?: EnumValidator<EnumFieldSpec>,
  accessor?: Accessor<string>,
};
export type ArrayFieldSpec = BaseFieldSpec & {
  type: 'array',
  operators: Array<ArrayFieldOperator>,
  subfield: EnumFieldSpec | NumberFieldSpec,
  validator?: ArrayValidator<ArrayFieldSpec>,
  accessor?: Accessor<string | number>,
};
export type TextFieldSpec = BaseFieldSpec & {
  type: 'text',
  operators: Array<TextFieldOperator>,
  validator?: TextValidator,
  accessor?: Accessor<string>,
};
export type NumberFieldSpec = BaseFieldSpec & {
  type: 'number',
  operators: Array<NumberFieldOperator>,
  validator?: TextValidator,
  accessor?: Accessor<number>,
};

export type DateType = Date | number;
export type SelectedDate = DateType | [DateType, DateType];
export type OnAddFilter = (newFilter: FieldQuery, currentFilters: FilterQuery) => FilterQuery;

export type DateTimeFieldSpec = BaseFieldSpec & {
  type: 'datetime',
  operators: Array<DateTimeFieldOperator>,
  selectedDate?: SelectedDate,
  onAddFilter?: OnAddFilter,
  maxDate?: Date | number,
  minDate?: Date | number,
  validator?: DateTimeValidator,
  accessor?: Accessor<Date>,
};
type SuggestedKey = { label: string };
export type SuggestedKeys = { [key: string]: SuggestedKey };
export type DictionaryFieldSpec = BaseFieldSpec & {
  type: 'dictionary',
  operators: Array<DictionaryFieldOperators>,
  suggestedKeys?: SuggestedKeys,
  validator?: DictionaryValidator,
  accessor?: Accessor<Record<string, string>>,
};
export type RecordFieldSpec = BaseFieldSpec & {
  type: 'record',
  operators: Array<RecordFieldOperators>,
  fields: Fields,
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

export const isRangeOperationValue = (input: unknown): input is RangeOperationValue => {
  return Array.isArray(input) && input.length === 2 && typeof input[0] === 'number' && typeof input[1] === 'number';
};

// Dummy symbol maps and label function to avoid errors
const enumOperatorsToSymbolMap: Record<EnumFieldOperator, string> = {
  '$in': 'in',
  '$nin': 'nin',
  '$eq': '=',
  '$ne': '!='
};

const numberOperatorsToSymbolMap: Record<NumberFieldOperator, string> = {
  '$eq': '=',
  '$gt': '>',
  '$gte': '>=',
  '$lt': '<',
  '$lte': '<=',
  '$ne': '!='
};

const dateTimeFieldOperatorsToSymbolMap: Record<DateTimeFieldOperator, string> = {
  '$eq': '=',
  '$gt': '>',
  '$gte': '>=',
  '$lt': '<',
  '$lte': '<=',
  '$ne': '!=',
  '$range': 'range'
};

// Dummy implementation of getOperatorLabel to avoid type errors
function getOperatorLabel(op: Operator, _field?: Field): string {
  return op;
}

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
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    queryOperation = { $ne: value[0]! };
  } else {
    // Default to $eq
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    queryOperation = { $eq: value[0]! };
  }
  
  return queryOperation;
};

// Type guard to check if an operator is a NumberFieldOperator
function isNumberFieldOperator(op: Operator): op is NumberFieldOperator {
  return (numberFieldOperators as ReadonlyArray<string>).includes(op);
}

const encodeArrayFieldQueryOperation = (
  operators: ArrayFieldOperator[],
  value: Array<Primitive> | Primitive,
  selectedOperator: ArrayFieldOperator,
  selectedSubOperator: EnumFieldOperator | NumberFieldOperator | null,
): QueryOperation | null => {
  if (Array.isArray(value) && value.length === 0) { return null; }
  
  let queryOperation: QueryOperation;
  
  if (operators.includes('$ne') && selectedOperator === '$ne') {
    queryOperation = { $ne: value };
  } else if (operators.includes('$any') && selectedOperator === '$any' && selectedSubOperator) {
    if (selectedSubOperator === '$in' && Array.isArray(value)) {
      queryOperation = { $any: { $or: value.map(v => ({ $eq: v })) } };
    } else if (selectedSubOperator === '$nin' && Array.isArray(value)) {
      queryOperation = { $any: { $and: value.map(v => ({ $ne: v })) } };
    } else if (isNumberFieldOperator(selectedSubOperator) && typeof value === 'string') {
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
    } else if (isNumberFieldOperator(selectedSubOperator) && typeof value === 'string') {
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
  let queryOperation: QueryOperation | null = null;
  if (isRangeOperationValue(value)) {
    if (!value[0] || !value[1]) {
      return null;
    }
    if (operators.includes('$range')) {
      queryOperation = { $range: value };
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

  let operand: unknown = [];

  if (operator === '$any' && '$any' in operation) {
    const anyValue = operation.$any;
    if ('$or' in anyValue && Array.isArray(anyValue.$or)) {
      const values = anyValue.$or;
      operand = values.map(value => {
        if (typeof value === 'object' && value !== null && '$eq' in value) {
          subOperatorSymbol = getOperatorLabel('$in', field.subfield);
          return (value as { $eq: unknown }).$eq;
        }
        return value;
      });
    } else if ('$and' in anyValue && Array.isArray(anyValue.$and)) {
      const values = anyValue.$and;
      operand = values.map(value => {
        if (typeof value === 'object' && value !== null && '$ne' in value) {
          subOperatorSymbol = getOperatorLabel('$nin', field.subfield);
          return (value as { $ne: unknown }).$ne;
        }
        return value;
      });
    } else {
      const subKeys = Object.keys(anyValue);
      if (subKeys.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const subOperator = subKeys[0]!; // non-null assertion
        const subVal = (anyValue as Record<string, unknown>)[subOperator];
        if (numberFieldOperators.includes(subOperator as NumberFieldOperator)) {
          subOperatorSymbol = getOperatorLabel(subOperator as Operator, field.subfield);
          operand = subVal;
        }
      }
    }
  } else if (operator === '$all' && '$all' in operation) {
    const allValue = operation.$all;
    if ('$or' in allValue && Array.isArray(allValue.$or)) {
      const values = allValue.$or;
      operand = values.map(value => {
        if (typeof value === 'object' && value !== null && '$eq' in value) {
          subOperatorSymbol = getOperatorLabel('$in', field.subfield);
          return (value as { $eq: unknown }).$eq;
        }
        return value;
      });
    } else if ('$and' in allValue && Array.isArray(allValue.$and)) {
      const values = allValue.$and;
      operand = values.map(value => {
        if (typeof value === 'object' && value !== null && '$ne' in value) {
          subOperatorSymbol = getOperatorLabel('$nin', field.subfield);
          return (value as { $ne: unknown }).$ne;
        }
        return value;
      });
    } else {
      const subKeys = Object.keys(allValue);
      if (subKeys.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const subOperator = subKeys[0]!;
        const subVal = (allValue as Record<string, unknown>)[subOperator];
        if (subOperator && numberFieldOperators.includes(subOperator as NumberFieldOperator)) {
          subOperatorSymbol = getOperatorLabel(subOperator as Operator, field.subfield);
          operand = subVal;
        }
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

export const decodeFieldQuery = (fieldQuery: FieldQuery, fields: Fields): {
  fieldName: FieldName,
  operator: Operator,
  operatorSymbol: string,
  operand: unknown,
  subOperatorSymbol?: string,
} => {
  const field = fieldQuery.fieldName ? fields[fieldQuery.fieldName] : null;
  const fieldType = field ? field.type : null;

  if (fieldType === 'enum') {
    return decodeEnumFieldQuery(fieldQuery);
  }
  if (field && field.type === 'array') {
    return decodeArrayFieldQuery(fieldQuery, field);
  }
  if (fieldType === 'number') {
    return decodeNumberFieldQuery(fieldQuery);
  }
  if (fieldType === 'datetime') {
    return decodeDateTimeFieldQuery(fieldQuery);
  }

  const operator = Object.keys(fieldQuery.operation)[0] as Operator;
  const operatorSymbol = ':';
  const operationValue = Object.values(fieldQuery.operation)[0];
  let operand: unknown = operationValue;

  if (operator === '$text') {
    if (typeof operationValue === 'object' && operationValue !== null && '$search' in operationValue) {
      operand = (operationValue as { $search: string }).$search;
    } else {
      operand = '';
    }
  }

  return {
    fieldName: fieldQuery.fieldName,
    operator,
    operatorSymbol,
    operand,
  };
};
