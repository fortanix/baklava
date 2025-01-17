/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const compareOrdered = (a: number, b: number): number => {
  return a === b ? 0 : a > b ? 1 : -1;
};

// Sort by JS `Date`
// Note: builtin react-table `datetime` sort method does not handle dates that may be undefined/null:
//   https://github.com/tannerlinsley/react-table/blob/master/src/sortTypes.js
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const sortDateTime = (row1: { values: any }, row2: { values: any }, columnId: string) => {
  const cell1 = row1.values[columnId];
  const cell2 = row2.values[columnId];

  if (!(cell1 instanceof Date) && !(cell2 instanceof Date)) {
    return 0;
  }
  if (!(cell1 instanceof Date)) {
    return 1; // Consider a nonexisting date to come *after* an existing date
  }
  if (!(cell2 instanceof Date)) {
    return -1; // Consider a nonexisting date to come *after* an existing date
  }

  return compareOrdered(cell1.getTime(), cell2.getTime());
};
