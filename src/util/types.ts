/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TypeScript has `NonNullable` built in, but not `NonUndefined`.
// Note: when TS refines non-undefined, it produces `T & ({} | null)`. Do not define this type as
// `T extends undefined ? never : T`, because you cannot `T & ({} | null)` cannot be assigned to such a conditional.
// https://www.typescriptlang.org/play/?#code/LAKAxg9gdgzgLgAgGZQQXgQHgCoBoB8AFAIYBOA5gFwLYCU6+CA3qAmwgJZIKFwCeABwCmEbmXLo0GAOQBXKABMhSDlCELp9FiHa6EpIXFmkoAblbsAvhbbjzIS-aA
export type NonUndefined<T> = T & ({} | null);

// https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript
export const assertUnreachable = (value: never, message?: string): never => {
  console.error('Unexpected value:', value);
  throw new Error(message ?? `Unexpected case`);
};
