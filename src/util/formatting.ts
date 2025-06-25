/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const capitalizeFirstLetter = (input: string) => {
  return String(input).charAt(0).toUpperCase() + String(input).slice(1);
};

/**
 * Removes all combining characters, in order to convert a string like "café" to plain ASCII, e.g. "cafe".
 * @param input The input string to transform.
 * @see {@link https://stackoverflow.com/questions/11815883/convert-non-ascii-characters-umlauts-accents}
 */
export const removeCombiningCharacters = (input: string): string => {
  const combining = /[\u0300-\u036F]/g;
  return input.normalize('NFKD').replace(combining, '').toLocaleLowerCase();
};
