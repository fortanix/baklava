/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, expect } from 'vitest';

import * as ObjectUtil from './object_util.ts';


describe('ObjectUtil', () => {
  test('isObject should resolve true given an object', () => {
    expect(ObjectUtil.isObject(undefined)).toBe(false);
    expect(ObjectUtil.isObject(null)).toBe(false);
    expect(ObjectUtil.isObject(NaN)).toBe(false);
    expect(ObjectUtil.isObject(0)).toBe(false);
    expect(ObjectUtil.isObject(-42)).toBe(false);
    expect(ObjectUtil.isObject('')).toBe(false);
    expect(ObjectUtil.isObject('foo')).toBe(false);
    expect(ObjectUtil.isObject(42n)).toBe(false);
    
    expect(ObjectUtil.isObject(Object.create(null))).toBe(true);
    expect(ObjectUtil.isObject({})).toBe(true);
    expect(ObjectUtil.isObject({ x: 42 })).toBe(true);
    expect(ObjectUtil.isObject([])).toBe(true);
    expect(ObjectUtil.isObject(new String('foo'))).toBe(true);
    expect(ObjectUtil.isObject(new Number(42))).toBe(true);
    expect(ObjectUtil.isObject(/regex/)).toBe(true);
    expect(ObjectUtil.isObject((x: number) => x + 1)).toBe(true);
    expect(ObjectUtil.isObject(class Foo {})).toBe(true);
    expect(ObjectUtil.isObject(new class Foo {}())).toBe(true);
  });
  
  test('isObjectDict should resolve true given an object', () => {
    expect(ObjectUtil.isObjectDict(undefined)).toBe(false);
    expect(ObjectUtil.isObjectDict(null)).toBe(false);
    expect(ObjectUtil.isObjectDict(NaN)).toBe(false);
    expect(ObjectUtil.isObjectDict(0)).toBe(false);
    expect(ObjectUtil.isObjectDict(-42)).toBe(false);
    expect(ObjectUtil.isObjectDict('')).toBe(false);
    expect(ObjectUtil.isObjectDict('foo')).toBe(false);
    expect(ObjectUtil.isObjectDict(42n)).toBe(false);
    
    expect(ObjectUtil.isObjectDict(Object.create(null))).toBe(true);
    expect(ObjectUtil.isObjectDict({})).toBe(true);
    expect(ObjectUtil.isObjectDict({ x: 42 })).toBe(true);
    expect(ObjectUtil.isObjectDict([])).toBe(true);
    expect(ObjectUtil.isObjectDict(new String('foo'))).toBe(true);
    expect(ObjectUtil.isObjectDict(new Number(42))).toBe(true);
    expect(ObjectUtil.isObjectDict(/regex/)).toBe(true);
    expect(ObjectUtil.isObjectDict((x: number) => x + 1)).toBe(true);
    expect(ObjectUtil.isObjectDict(class Foo {})).toBe(true);
    expect(ObjectUtil.isObjectDict(new class Foo {}())).toBe(true);
  });
  
  test('isPlainObject should resolve true given a plain object (prototype: null or Object.prototype)', () => {
    expect(ObjectUtil.isPlainObject(undefined)).toBe(false);
    expect(ObjectUtil.isPlainObject(null)).toBe(false);
    expect(ObjectUtil.isPlainObject(NaN)).toBe(false);
    expect(ObjectUtil.isPlainObject(0)).toBe(false);
    expect(ObjectUtil.isPlainObject(-42)).toBe(false);
    expect(ObjectUtil.isPlainObject('')).toBe(false);
    expect(ObjectUtil.isPlainObject('foo')).toBe(false);
    expect(ObjectUtil.isPlainObject(42n)).toBe(false);
    
    expect(ObjectUtil.isPlainObject([])).toBe(false);
    expect(ObjectUtil.isPlainObject(new String('foo'))).toBe(false);
    expect(ObjectUtil.isPlainObject(new Number(42))).toBe(false);
    expect(ObjectUtil.isPlainObject(/regex/)).toBe(false);
    expect(ObjectUtil.isPlainObject((x: number) => x + 1)).toBe(false);
    expect(ObjectUtil.isPlainObject(class Foo {})).toBe(false);
    expect(ObjectUtil.isPlainObject(new class Foo {}())).toBe(false);
    
    expect(ObjectUtil.isPlainObject(Object.create(null))).toBe(true);
    expect(ObjectUtil.isPlainObject({})).toBe(true);
    expect(ObjectUtil.isPlainObject({ x: 42 })).toBe(true);
  });
  
  describe('map', () => {
    test('should map the given function over the object properties', () => {
      const obj: ObjectUtil.Dict<string, string> = {
        a: '',
        b: 'hello',
        c: 'foo',
      };
      
      // Note: TS should be able to infer `ObjectUtil.Dict<string, number>` for `objMapped`. However this is hard to
      // test automatically because we cannot assert anything against `any`. Can manually check for it instead.
      const objMapped: ObjectUtil.Dict<string, number> = ObjectUtil.map(obj, x => x.length);
      
      expect(objMapped).toEqual({
        a: 0,
        b: 5,
        c: 3,
      });
    });
    
    test('should be immutable', () => {
      const obj: ObjectUtil.Dict<string, number> = {
        a: 42,
        b: -1,
        c: 0,
      };
      
      const objMapped: ObjectUtil.Dict<string, number> = ObjectUtil.map(obj, x => x + 1);
      
      expect(objMapped).toEqual({
        a: 43,
        b: 0,
        c: 1,
      });
      
      // Original reference should be unchanged
      expect(objMapped).not.toBe(obj);
      expect(obj).toEqual({
        a: 42,
        b: -1,
        c: 0,
      });
    });
    
    test('should pass key as optional second argument', () => {
      const obj = {
        a: '',
        b: 'hello',
        c: 'foo',
      } as const;
      
      const objMapped: ObjectUtil.Dict<keyof typeof obj, keyof typeof obj> = ObjectUtil.map(obj, (_x, key) => key);
      
      expect(objMapped).toEqual({
        a: 'a',
        b: 'b',
        c: 'c',
      });
    });
  });
  
  describe('filter', () => {
    test('should filter just the properties that satisfy the given predicate function', () => {
      const obj = {
        a: 42,
        b: -1,
        c: 0,
      } as const;
      
      const objFiltered: ObjectUtil.Dict<string, number> = ObjectUtil.filter(obj, x => x >= 0);
      
      expect(objFiltered).toEqual({
        a: 42,
        c: 0,
      });
    });
    
    test('should be immutable', () => {
      const obj = {
        a: 42,
        b: -1,
        c: 0,
      } as const;
      
      const objFiltered: ObjectUtil.Dict<string, number> = ObjectUtil.filter(obj, x => x >= 0);
      
      expect(objFiltered).toEqual({
        a: 42,
        c: 0,
      });
      
      // Original reference should be unchanged
      expect(objFiltered).not.toBe(obj);
      expect(obj).toEqual({
        a: 42,
        b: -1,
        c: 0,
      });
    });
    
    test('should pass key as optional second argument', () => {
      const obj = {
        a: '',
        b: 'hello',
        c: 'foo',
      } as const;
      
      const objFiltered: ObjectUtil.Dict<keyof typeof obj, ObjectUtil.ValueOf<typeof obj>> =
        ObjectUtil.filter(obj, (_x, key) => key !== 'a');
      
      expect(objFiltered).toEqual({
        b: 'hello',
        c: 'foo',
      });
    });
  });

  describe('filterWithTypeGuard', () => {
    test('should filter just the properties that satisfy the given predicate function', () => {
      const obj = {
        a: 42,
        b: -1,
        c: 0,
      } as const;
      
      const objFiltered: ObjectUtil.Dict<string, number> =
        ObjectUtil.filterWithTypeGuard(obj, (x: number): x is number => x >= 0);
      
      expect(objFiltered).toEqual({
        a: 42,
        c: 0,
      });
    });
    
    test('should be immutable', () => {
      const obj = {
        a: 42,
        b: -1,
        c: 0,
      } as const;
      
      const objFiltered: ObjectUtil.Dict<string, number> = ObjectUtil.filterWithTypeGuard(obj, x => x >= 0);
      
      expect(objFiltered).toEqual({
        a: 42,
        c: 0,
      });
      
      // Original reference should be unchanged
      expect(objFiltered).not.toBe(obj);
      expect(obj).toEqual({
        a: 42,
        b: -1,
        c: 0,
      });
    });
    
    test('should pass key as optional second argument', () => {
      const obj = {
        a: '',
        b: 'hello',
        c: 'foo',
      } as const;
      
      const objFiltered: ObjectUtil.Dict<keyof typeof obj, ObjectUtil.ValueOf<typeof obj>> =
        ObjectUtil.filterWithTypeGuard(obj, (_x, key) => key !== 'a');
      
      expect(objFiltered).toEqual({
        b: 'hello',
        c: 'foo',
      });
    });
  });
  
  describe('reduce', () => {
    test('should reduce the properties of the object to a single value', () => {
      const obj = {
        a: 10,
        b: 20,
        c: 30,
      } as const;
      
      const sum: number = ObjectUtil.reduce(obj, (acc, [key, value]) => acc + value, 0);
      
      expect(sum).toBe(60);
    });
    
    test('should be immutable', () => {
      const obj = {
        a: 10,
        b: 20,
        c: 30,
      } as const;
      
      const sum: number = ObjectUtil.reduce(obj, (acc, [key, value]) => acc + value, 0);
      
      expect(sum).toBe(60);
      
      // Original reference should be unchanged
      expect(obj).toEqual({
        a: 10,
        b: 20,
        c: 30,
      });
    });
  });
});
