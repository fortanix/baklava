/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  seed,
  randFirstName,
  randLastName,
  randEmail,
  randCompanyName,
  randBetweenDate,
  randUuid,
  randJobDescriptor,
  randSentence,
} from '@ngneat/falso';

export type User = {
  id: string,
  name: string,
  email: string,
  company: string,
  joinDate: Date,
  description: string,
  dummy_1: string,
  dummy_2: string,
  dummy_3: string,
  dummy_4: string,
  dummy_5: string,
};

type GenerateDataArgs = { numItems: number, seed?: undefined | string };
export const generateData = ({ numItems = 10, seed: seedValue }: GenerateDataArgs) => {
  seed(seedValue ?? 'some-constant-seed'); // Use a fixed seed for consistent results
  
  const data: Array<User> = [];
  
  for (let i = 0; i < numItems; i += 1) {
    const firstName = randFirstName();
    const lastName = randLastName();
    data.push({
      id: randUuid(),
      name: `${firstName} ${lastName}`,
      email: randEmail({ firstName, lastName }),
      company: randCompanyName(),
      joinDate: randBetweenDate({ from: new Date('01/01/2016'), to: new Date('01/01/2026') }),
      description: randSentence(),
      dummy_1: `${firstName} ${lastName}`,
      dummy_2: randCompanyName(),
      dummy_3: randCompanyName(),
      dummy_4: randEmail({ firstName, lastName }),
      dummy_5: randJobDescriptor(),
    });
  }
  
  return data;
};
