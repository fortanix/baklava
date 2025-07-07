/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { seed, randUuid, randFullName, randNumber, rand } from '@ngneat/falso';

export type Sobject = {
  id: string,
  name: string,
  kcv: number,
  created: string,
  type: 'AES' | 'DES' | 'DES3' | 'SECRET',
  size: number,
  expires: string,
  group: string,
  created_by: string,
};

export const generateSobjects = ({ numItems = 10 } = {}): Array<Sobject> => {
  seed('some-constant-seed'); // Use a fixed seed for consistent results
  
  const data = [];
  const keyNames = [
    'rsa-01_Copy (copied at 29-06-2021 02:04:13.987)',
    'rsa-01_Copy (copied at 29-06-2021 02:04:13.987) (rotated at 2021-06-29 09:08:34)',
    'rsa-01_Copy (copied at 29-06-2021 02:04:10.557) (rotated at 2021-06-29 09:08:39)',
    'Az-key-rsa-2',
    'Az-key-rsa-1',
    'Az-key-rsa-21',
    'rsa-01_Copy (copied at 29-06-2021 11:44:59.083)',
  ];
  
  for (let i = 0; i < numItems; i += 1) {
    data.push({
      id: randUuid(),
      name: rand(keyNames),
      kcv: randNumber({ min: 1000, max: 9999 }),
      created: rand(['2 seconds ago', '2 months ago', '5 minutes ago']),
      type: rand(['AES', 'DES', 'DES3', 'SECRET']) as Sobject['type'],
      size: rand([256, 128, 1024]),
      expires: 'Never',
      group: rand(['Test Group', 'another Group', 'Normal Group']),
      created_by: randFullName(),
    });
  }
  
  return data;
};
