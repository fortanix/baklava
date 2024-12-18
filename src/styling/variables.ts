/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import variablesText from './variables.scss?raw';


/*
Some utilities to parse out information from `variables.scss` in order to use them in TypeScript code.
*/

type Variables = Record<string, string>;
const variables = [...variablesText.matchAll(/\$(.+):(.+)(?:!default).*;/g)].reduce<Variables>(
  (variables, [match, variableName, variableValue]) => {
    if (!match.includes('/* ignore */') && variableName && variableValue) {
      variables[variableName.trim()] = variableValue.trim();
    }
    return variables;
  },
  {},
);

type FontSizes = Record<string, { sizeQualifier: string, sizeInRem: number }>;
export const fontSizes = Object.entries(variables).reduce<FontSizes>(
  (fontSizes, [variableName, value]) => {
    const match = variableName.match(/^font-size-(.+)$/);
    if (!match) { return fontSizes; }
    
    const [_, sizeQualifier] = match;
    if (typeof sizeQualifier === 'undefined') { throw new Error(`Expected match`); }
    
    const sizeMatches = value.match(/math\.div\((\d+), (\d+)\)/);
    if (!sizeMatches) { throw new Error(`Unable to parse size: ${value}`); }
    
    fontSizes[variableName] = {
      sizeQualifier,
      sizeInRem: Number(sizeMatches[1]) / Number(sizeMatches[2]),
    };
    return fontSizes;
  },
  {},
);
