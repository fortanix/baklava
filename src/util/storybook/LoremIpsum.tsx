/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dedent } from 'ts-dedent';

import { classNames as cx, type ComponentProps } from '../componentUtil.ts';


const loremIpsumSentence = dedent`
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
`;
const loremIpsumParagraph = dedent`
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

export type LoremIpsumProps = ComponentProps<'article'> & {
  short?: undefined | boolean,
  paragraphs?: undefined | number,
};
export const LoremIpsum = ({ short = false, paragraphs = 1, ...propsRest }: LoremIpsumProps) => {
  if (!Number.isSafeInteger(paragraphs) || paragraphs < 1) {
    throw new Error(`Invalid amount of paragraphs: ${paragraphs}`);
  }
  
  return (
    <article
      {...propsRest}
      className={cx('bk-body-text', propsRest.className)}
    >
      {short
        ? <p>{loremIpsumSentence}</p>
        // biome-ignore lint/suspicious/noArrayIndexKey: No other key available.
        : Array.from({ length: paragraphs }).map((_, index) => <p key={index}>{loremIpsumParagraph}</p>)
      }
    </article>
  );
};
