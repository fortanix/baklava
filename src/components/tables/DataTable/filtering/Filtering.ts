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
} from '../../../../prefab/forms/MultiSearch/MultiSearch';

type Primitive = string | number;
type Uuid = string;

const parseDateTime = (date: Date): number => {
  return getUnixTime(date);
};

const parseStringField = (field: Primitive) => {
  if (typeof field === 'string') {
    return field.trim().toLowerCase();
  } else {
    return field;
  }
};

const numericOperation = (numericField: number, operation: FieldQuery['operation']): boolean => {
  if ('$eq' in operation) {
    return numericField === operation.$eq;
  } else if ('$ne' in operation) {
    return numericField !== operation.$ne;
  } else if ('$gte' in operation) {
    return numericField >= operation.$gte;
  } else if ('$gt' in operation) {
    return numericField > operation.$gt;
  } else if ('$lte' in operation) {
    return numericField <= operation.$lte;
  } else if ('$lt' in operation) {
    return numericField < operation.$lt;
  } else if ('$range' in operation) {
    return numericField >= operation.$range[0] && numericField <= operation.$range[1];
  } else {
    throw new TypeError(`Unknown query operator`);
  }
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
      } else {
        throw new TypeError(`Unknown query operator`);
      }
    }
    case 'datetime': {
      const fieldAsDate = parseDateTime(field as Date); // Unsafe but guaranteed by `TypeOfFieldSpec`
      return numericOperation(fieldAsDate, operation);
    }
    case 'array': {
      const fieldAsArray = field as Array<TypeOfFieldSpec<ArrayFieldSpec['subfield']>>; // Unsafe but guaranteed by `S`
      
      if ('$eq' in operation) {
        return fieldAsArray.every(field => (operation.$eq as typeof fieldAsArray).indexOf(field) >= 0);
      } else if ('$ne' in operation) {
        return fieldAsArray.every(field => (operation.$ne as typeof fieldAsArray).indexOf(field) < 0);
      } else if ('$all' in operation) {
        const elementFieldSpec = fieldSpec.subfield;
        return fieldAsArray.every(element => {
          if ('$and' in operation.$all && Array.isArray(operation.$all.$and)) {
            const operations = operation.$all.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else if ('$or' in operation.$all && Array.isArray(operation.$all.$or)) {
            const operations = operation.$all.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else {
            throw new TypeError(`Unsupported array operation`);
          }
        });
      } else if ('$any' in operation) {
        return fieldAsArray.some(element => {
          const elementFieldSpec = fieldSpec.subfield;
          if ('$and' in operation.$any && Array.isArray(operation.$any.$and)) {
            const operations = operation.$any.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else if ('$or' in operation.$any && Array.isArray(operation.$any.$or)) {
            const operations = operation.$any.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else {
            throw new TypeError(`Unsupported array operation`);
          }
        });
      } else {
        throw new TypeError(`Unknown query operator`);
      }
    }
    case 'dictionary': {
      const fieldAsDictionary = field as string; // Unsafe but guaranteed by `S`
      
      if ('$all' in operation) {
        return fieldAsDictionary.includes(Object.values(operation.$all)[0]);
      } else {
        throw new TypeError(`Unknown query operator`);
      }
    }
    case 'enum': {
      const fieldAsEnum = field as string; // Unsafe but guaranteed by `S`
      
      if ('$in' in operation) {
        return operation.$in.indexOf(fieldAsEnum) !== -1;
      } else if ('$nin' in operation) {
        return operation.$nin.indexOf(fieldAsEnum) === -1;
      } else if ('$eq' in operation) {
        return fieldAsEnum.includes(operation.$eq as string);
      } else if ('$ne' in operation) {
        return !fieldAsEnum.includes(operation.$ne as string);
      } else {
        throw new TypeError(`Unknown query operator`);
      }
    }
    case 'record': {
      const fieldAsRecord = field as TypeOfFieldsSpec<RecordFieldSpec['fields']>; // Unsafe but guaranteed by `S`
      
      if ('$all' in operation) {
        return Object.values(fieldAsRecord).every(element => {
          const elementFieldSpec = Object.values(fieldSpec.fields)[0];
          if ('$and' in operation.$all && Array.isArray(operation.$all.$and)) {
            const operations = operation.$all.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else if ('$or' in operation.$all && Array.isArray(operation.$all.$or)) {
            const operations = operation.$all.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else {
            const fieldName: keyof RecordFieldSpec['fields'] = Object.keys(operation.$all)[0];
            const operations: FieldQuery['operation'] = Object.values(operation.$all)[0];
            if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
              const item = element as Record<string, string>;
              return matchesFieldQuery(elementFieldSpec, item[fieldName], operations);
            } else {
              return matchesFieldQuery(elementFieldSpec, element, operations);
            }
          }
        });
      } else if ('$any' in operation) {
        return Object.values(fieldAsRecord).some(element => {
          const elementFieldSpec = Object.values(fieldSpec.fields)[0];
          if ('$and' in operation.$any && Array.isArray(operation.$any.$and)) {
            const operations = operation.$any.$and;
            return operations.every(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else if ('$or' in operation.$any && Array.isArray(operation.$any.$or)) {
            const operations = operation.$any.$or;
            return operations.some(operation => matchesFieldQuery(elementFieldSpec, element, operation));
          } else {
            const fieldName: keyof RecordFieldSpec['fields'] = Object.keys(operation.$any)[0];
            const operations: FieldQuery['operation'] = Object.values(operation.$any)[0];
            if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
              const item = element as Record<string, string>;
              return matchesFieldQuery(elementFieldSpec, item[fieldName], operations);
            } else {
              return matchesFieldQuery(elementFieldSpec, element, operations);
            }
          }
        });
      } else {
        throw new TypeError(`Unknown query operator`);
      }
    }
    default: throw new TypeError(`Unknown field type`);
  }
};

const getFieldValue = <S extends Fields>(fieldSpec: Field, item: TypeOfFieldsSpec<S>, fieldName: string) => {
  if (fieldSpec.accessor) {
    return fieldSpec.accessor(item);
  } else if (fieldName !== '') {
    return item[fieldName];
  } else {
    throw new TypeError('Unable to get field value, expected either `accessor` or `fieldName` to be configured');
  }
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
          const fieldSpec: Field = spec[fieldName];
          const fieldValue = getFieldValue(fieldSpec, item, fieldName) as TypeOfFieldSpec<typeof fieldSpec>;
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
  } else {
    return items;
  }
};
