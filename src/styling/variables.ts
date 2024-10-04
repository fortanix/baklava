/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import variablesText from './variables.scss?raw';


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


type VariableName = string;

type Color = { category: string, weight: number, color: string };
type Colors = Record<VariableName, Color>;
export const colors = Object.entries(variables).reduce<Colors>(
  (colors, [variableName, value]) => {
    const match = variableName.match(/^color-(.+)-(\d+)$/);
    if (!match) { return colors; }
    
    const [_, category, weight] = match;
    if (typeof category === 'undefined' || typeof weight === 'undefined') { throw new Error(`Expected match`); }
    
    colors[variableName] = { category, weight: Number(weight), color: value };
    return colors;
  },
  {},
);

// Group colors by category
type ColorsByCategory = Record<VariableName, Record<string, Color>>;
export const colorsByCategory = Object.values(colors).reduce<ColorsByCategory>(
  (colorsByCategory, { category, weight, color }) => {
    colorsByCategory[category] = Object.assign(
      colorsByCategory[category] ?? {},
      { [`${category}-${weight}`]: { category, weight: Number(weight), color } },
    );
    return colorsByCategory;
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
    
    fontSizes[variableName] = { sizeQualifier, sizeInRem: Number(value.replace('rem', '')) };
    return fontSizes;
  },
  {},
);
