/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// https://stackoverflow.com/a/44622300/233884
type GenerateRandomIdOptions = { length: number, prefix: string };
export const generateRandomId = ({ length = 12, prefix = '' }: Partial<GenerateRandomIdOptions> = {}): string => {
  return prefix + Array.from(Array(length), () => Math.floor(Math.random() * 36).toString(36)).join('');
};
