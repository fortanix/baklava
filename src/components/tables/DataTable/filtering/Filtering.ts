/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getUnixTime } from 'date-fns';
import type {
  ArrayFieldSpec,
  RecordFieldSpec,
  FieldQuery,
  FilterQuery,
  Fields,
  Field,
  TypeOfFieldSpec,
  TypeOfFieldsSpec,
} from '../../MultiSearch/filterQuery.ts';

type Primitive = string | number;
type Uuid = string;

const parseDateTime = (date: Date): number => {
  return getUnixTime(date);
};

const parseStringField = (field: Primitive) => {
  if (typeof field === 'string') {
    return field.trim().toLowerCase();
  }
  return field;
};

const numericOperation = (numericField: number, operation: FieldQuery['operation']): boolean => {
  if ('$eq' in operation) {
    return numericField === operation.$eq;
  } if ('$ne' in operation) {
    return numericField !== operation.$ne;
  } if ('$gte' in operation) {
    return numericField >= operation.$gte;
  } if ('$gt' in operation) {
    return numericField > operation.$gt;
  } if ('$lte' in operation) {
    return numericField <= operation.$lte;
  } if ('$lt' in operation) {
    return numericField < operation.$lt;
  } if ('$range' in operation) {
    return numericField >= operation.$range[0] && numericField <= operation.$range[1];
  }
  throw new TypeError('Unknown query operator');
};

const matchesFieldQuery = <S extends Field>(
  fieldSpec: S,
  field: TypeOfFieldSpec<S>,
  operation: FieldQuery['operation'],
): boolean => {
  switch (fieldSpec.type) {
    case 'number': {
      const fieldAsNumber = field as number; // Unsafe but guaranteed by `TypeOfFieldSpec`
      return numericOperation(fieldAsNumber, operation);
    }
    case 'text': {
      const fieldAsString = parseStringField(field as Primitive) as string; // Unsafe but guaranteed by `S`

      if ('$text' in operation) {
        return fieldAsString.includes(operation.$text.$search.toLowerCase());
      }
      throw new TypeError('Unknown query operator');
    }
    case 'datetime': {
      const fieldAsDate = parseDateTime(field as Date); // Unsafe but guaranteed by `TypeOfFieldSpec`
      return numericOperation(fieldAsDate, operation);
    }
    case 'array': {
      const fieldAsArray = field as Array<TypeOfFieldSpec<ArrayFieldSpec['subfield']>>; // Unsafe but guaranteed by `S`

      if ('$eq' in operation) {
        const arr = operation.$eq as Primitive[];
        return fieldAsArray.every(element => arr.indexOf(element as Primitive) >= 0);
      } if ('$ne' in operation) {
        const arr = operation.$ne as Primitive[];
        return fieldAsArray.every(element => arr.indexOf(element as Primitive) < 0);
      } if ('$all' in operation) {
        const elementFieldSpec = fieldSpec.subfield;
        if ('$and' in operation.$all && Array.isArray(operation.$all.$and)) {
          const operations = operation.$all.$and;
          return fieldAsArray.every(element =>
            operations.every(op => matchesFieldQuery(elementFieldSpec, element, op))
          );
        } if ('$or' in operation.$all && Array.isArray(operation.$all.$or)) {
          const operations = operation.$all.$or;
          return fieldAsArray.every(element =>
            operations.some(op => matchesFieldQuery(elementFieldSpec, element, op))
          );
        }
        throw new TypeError('Unsupported array operation');
      } if ('$any' in operation) {
        const elementFieldSpec = fieldSpec.subfield;
        if ('$and' in operation.$any && Array.isArray(operation.$any.$and)) {
          const operations = operation.$any.$and;
          return fieldAsArray.some(element =>
            operations.every(op => matchesFieldQuery(elementFieldSpec, element, op))
          );
        } if ('$or' in operation.$any && Array.isArray(operation.$any.$or)) {
          const operations = operation.$any.$or;
          return fieldAsArray.some(element =>
            operations.some(op => matchesFieldQuery(elementFieldSpec, element, op))
          );
        }
        throw new TypeError('Unsupported array operation');
      }
      throw new TypeError('Unknown query operator');
    }
    case 'dictionary': {
      const fieldAsDictionary = field as string; // Unsafe but guaranteed by `S`

      if ('$all' in operation) {
        const val = Object.values(operation.$all)[0];
        return val !== undefined && fieldAsDictionary.includes(String(val));
      }
      throw new TypeError('Unknown query operator');
    }
    case 'enum': {
      const fieldAsEnum = field as string; // Unsafe but guaranteed by `S`

      if ('$in' in operation) {
        return operation.$in.indexOf(fieldAsEnum) !== -1;
      } if ('$nin' in operation) {
        return operation.$nin.indexOf(fieldAsEnum) === -1;
      } if ('$eq' in operation) {
        return fieldAsEnum.includes(String(operation.$eq));
      } if ('$ne' in operation) {
        return !fieldAsEnum.includes(String(operation.$ne));
      }
      throw new TypeError('Unknown query operator');
    }
    case 'record': {
      const fieldAsRecord = field as TypeOfFieldsSpec<RecordFieldSpec['fields']>; // Unsafe but guaranteed by `S`

      if ('$all' in operation) {
        return Object.values(fieldAsRecord).every(element => {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const elementFieldSpec = Object.values(fieldSpec.fields)[0]!;
          if ('$and' in operation.$all && Array.isArray(operation.$all.$and)) {
            const operations = operation.$all.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } if ('$or' in operation.$all && Array.isArray(operation.$all.$or)) {
            const operations = operation.$all.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          }
          const allKey = Object.keys(operation.$all)[0];
          const fieldName = allKey as keyof RecordFieldSpec['fields'];
          const operations = Object.values(operation.$all)[0] as FieldQuery['operation'];
          if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
            const item = element as Record<string, string>;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            return matchesFieldQuery(elementFieldSpec, item[fieldName]!, operations);
          }
          return matchesFieldQuery(elementFieldSpec, element, operations);
        });
      } if ('$any' in operation) {
        return Object.values(fieldAsRecord).some(element => {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const elementFieldSpec = Object.values(fieldSpec.fields)[0]!;
          if ('$and' in operation.$any && Array.isArray(operation.$any.$and)) {
            const operations = operation.$any.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } if ('$or' in operation.$any && Array.isArray(operation.$any.$or)) {
            const operations = operation.$any.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          }
          const anyKey = Object.keys(operation.$any)[0];
          const fieldName = anyKey as keyof RecordFieldSpec['fields'];
          const operations = Object.values(operation.$any)[0] as FieldQuery['operation'];
          if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
            const item = element as Record<string, string>;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            return matchesFieldQuery(elementFieldSpec, item[fieldName]!, operations);
          }
          return matchesFieldQuery(elementFieldSpec, element, operations);
        });
      }
      throw new TypeError('Unknown query operator');
    }
    default: throw new TypeError('Unknown field type');
  }
};

const getFieldValue = <S extends Fields>(fieldSpec: Field, item: TypeOfFieldsSpec<S>, fieldName: string) => {
  if (fieldSpec.accessor) {
    return fieldSpec.accessor(item);
  } if (fieldName !== '') {
    return item[fieldName as keyof TypeOfFieldsSpec<S>];
  }
  throw new TypeError('Unable to get field value, expected either `accessor` or `fieldName` to be configured');
};

// Take some data that corresponds to the given spec (`Fields`), and return that data filtered through the given query
export const filterByQuery = <S extends Fields>(
  spec: S,
  items: Record<Uuid, TypeOfFieldsSpec<S>>,
  query: FilterQuery,
): Record<Uuid, TypeOfFieldsSpec<S>> => {
  type Item = TypeOfFieldsSpec<S>;
  if (query.length > 0) {
    const itemsFiltered: Record<Uuid, Item> = Object.entries(items)
      .filter(([_itemId, item]) => {
        // The `query` contains a list of `FieldQuery`s which should be combined through an `AND` operator
        return query.every(fieldQuery => {
          const fieldName: null | keyof S = fieldQuery.fieldName;
          if (fieldName === null) { return true; }
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const fieldSpec: Field = spec[fieldName]!;
          const fieldValue = getFieldValue(fieldSpec, item, fieldName as string) as TypeOfFieldSpec<typeof fieldSpec>;
          return matchesFieldQuery(fieldSpec, fieldValue, fieldQuery.operation);
        });
      })
      .reduce(
        (itemsAsRecord, [itemId, item]) => {
          itemsAsRecord[itemId] = item;
          return itemsAsRecord;
        },
        {} as Record<Uuid, Item>,
      );
    return itemsFiltered;
  }
  return items;
};
