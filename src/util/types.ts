/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/** Simplify the given type `T` (evaluating any type operations). Note: this is a shallow operation. */
export type SimplifyShallow<T> = { [K in keyof T]: T[K]; } & {};

/**
 * TypeScript has `NonNullable` built in, but not `NonUndefined`.
 * Note: when TS refines non-undefined, it produces `T & ({} | null)`. Do not define this type as
 * `T extends undefined ? never : T`, because `T & ({} | null)` cannot be assigned to such a conditional.
 */
// https://www.typescriptlang.org/play/?#code/LAKAxg9gdgzgLgAgGZQQXgQHgCoBoB8AFAIYBOA5gFwLYCU6+CA3qAmwgJZIKFwCeABwCmEbmXLo0GAOQBXKABMhSDlCELp9FiHa6EpIXFmkoAblbsAvhbbjzIS-aA
export type NonUndefined<T> = T & ({} | null);

/** Given a type `T`, the keys `K` should be required, and everything else becomes optional. */
export type RequireOnly<T, K extends keyof T> = Pick<Required<T>, K> & Partial<T>;

/**
 * Convert a union type to an intersection. For example:
 * ```
 *   type Test = UnionToIntersection<{ foo: 'a' | 'b' } | { foo: 'a' }>;
 *         ^ { foo: 'a' }
 * ```
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void)
  ? I
  : never;
