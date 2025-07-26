/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $msg from 'message-tag';


// Note: this also exists as a primitive in TS under the name `Record`, but the term "record" is better served for
// objects with a finite set of known keys with individually-typed properties (e.g. `{ x: number, y: string }`).
// Prefer "dict" (dictionary) for objects that serve as a map over an arbitrary set of keys.
export type Dict<K extends PropertyKey, T> = { [P in K]: T };

export type ValueOf<O extends object> = O[keyof O];
export type EntryOf<O extends object> = [key: keyof O, value: ValueOf<O>];


// Check if the given value is an object (treats the object as a *closed* type, i.e. `object`, cannot be used as dict)
export const isObject = (obj: unknown): obj is object => {
  // Note: functions are objects in JS, despite their difference in `typeof`. To exclude functions, perform an explicit
  // typeof check in addition to `isObject()`.
  return (typeof obj === 'object' || typeof obj === 'function') && obj !== null;
};

// Check if the given value is an object (treats the object as an *open* type, i.e. `Dict`, can be used as dictionary)
export const isObjectDict = (obj: unknown): obj is Dict<PropertyKey, unknown> => {
  return isObject(obj); // No difference at runtime
};

// Check if the given object is a plain object (prototype should be either `null` or `Object.prototype`)
export const isPlainObject = (obj: unknown): obj is object => {
  if (!isObject(obj)) { return false; }
  
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
};


// Versions of `Object.{entries,fromEntries,keys,values}` that maintain type information of keys/values
export const entries = <O extends object>(obj: O): Array<EntryOf<O>> =>
  Object.entries(obj) as any;
export const fromEntries = <O extends object>(entries: Array<EntryOf<O>>): O =>
  Object.fromEntries(entries) as any;
export const keys = <O extends object>(obj: O): Array<keyof O> =>
  Object.keys(obj) as any;
export const values = <O extends object>(obj: O): Array<ValueOf<O>> =>
  Object.values(obj) as any;


// Note: in TypeScript it is not currently supported to use `in` or `hasOwnProperty` as a type guard on generic objects.
// See: https://github.com/microsoft/TypeScript/issues/21732
export const hasProp = <O extends object, K extends PropertyKey>(
  obj: O,
  propKey: K,
): obj is O & { [key in K]: unknown } =>
  propKey in obj;

// Same as `hasProp`, but specifically checks for an own property (for TS there is no difference).
export const hasOwnProp = <O extends object, K extends PropertyKey>(
  obj: O,
  propKey: K,
): obj is O & { [key in K]: unknown } =>
  Object.hasOwn(obj, propKey);


// Map over the values of the given object
export const map = <O extends object, Result>(
  obj: O,
  // Note: `Result` generic is used to be able to infer the return value of the callback return type
  fn: (value: ValueOf<O>, key: keyof O) => Result,
): Dict<keyof O, Result> => {
  const result = {} as Dict<keyof O, Result>;
  for (const key of keys(obj)) {
    result[key] = fn(obj[key], key);
  }
  return result;
};

export const filter = <O extends object, P extends ValueOf<O>>(
  obj: O,
  predicate: (value: ValueOf<O>, key: keyof O) => boolean,
): Dict<keyof O, P> => {
  const entriesFiltered: Array<[keyof O, P]> = entries(obj)
    .filter((entry: [keyof O, ValueOf<O>]): entry is [keyof O, P] => {
      const [key, value] = entry;
      return predicate(value, key);
    });
  return fromEntries<Dict<keyof O, P>>(entriesFiltered);
};

// Variant of filter where the predicate is a type guard
export const filterWithTypeGuard = <O extends object, P extends ValueOf<O>>(
  obj: O,
  predicate: (value: ValueOf<O>, key: keyof O) => value is P,
): Dict<keyof O, P> => {
  const entriesFiltered: Array<[keyof O, P]> = entries(obj)
    .filter((entry: [keyof O, ValueOf<O>]): entry is [keyof O, P] => {
      const [key, value] = entry;
      return predicate(value, key);
    });
  return fromEntries<Dict<keyof O, P>>(entriesFiltered);
};

export const reduce = <O extends object, A>(
  obj: O,
  fn: (acc: A, entry: [key: keyof O, value: ValueOf<O>]) => A,
  initial: A,
) => {
  return entries(obj).reduce(fn, initial);
};


export const sort = <O extends object>(
  obj: O,
  compare: ([key1, value1]: EntryOf<O>, [key2, value2]: EntryOf<O>) => number,
) => {
  return fromEntries(
    entries(obj).sort(compare),
  );
};


export const getSingleKey = <O extends object>(obj: O): keyof O => {
  const objKeys = keys(obj);
  const singleKey = objKeys[0];
  
  if (typeof singleKey === 'undefined' || objKeys.length !== 1) {
    throw new TypeError($msg`Expected object with a single key, given ${obj}`);
  }
  
  return singleKey;
};
