/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { seed, randUuid, randFirstName, randLastName } from '@ngneat/falso';

export type Item = { id: string, name: string };

export const generateItems = ({ numItems = 10, seedValue = 'initial-seed' } = {}): Array<Item> => {
  seed(seedValue); // Use a fixed seed for consistent results
  
  const data: Array<Item> = [];
  
  for (let i = 0; i < numItems; i += 1) {
    const firstName = randFirstName();
    const lastName = randLastName();
    data.push({
      id: randUuid(),
      name: `${firstName} ${lastName}`,
    });
  }
  
  return data;
};
