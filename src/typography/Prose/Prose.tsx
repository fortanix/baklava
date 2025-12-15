/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';

import cl from './Prose.module.scss';


export { cl as ProseClassNames };

export type ProseProps = ComponentProps<'article'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * This component is intended for prose: document-style text, with rich styling for paragraphs, headings, lists,
 * tables, etc. By default in Baklava, all base styles for standard HTML elements are removed. Within a `<Prose>`
 * element, these styles are reapplied, so that you can use elements like `<p>`, `<ul>`, `<b>`, etc. without any class
 * names and still get the expected visual styling.
 * 
 * Note: any Baklava components nested within a `<Prose>` element will not be affected by these styles.
 */
export const Prose = ({ unstyled, ...propsRest }: ProseProps) => {
  return (
    <article
      {...propsRest}
      className={cx(
        'bk',
        { 'bk-prose': !unstyled },
        propsRest.className,
      )}
    />
  );
};
