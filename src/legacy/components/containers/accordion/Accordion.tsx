/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { ClassNameArgument, classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';
import { Button } from '../../buttons/Button';

import { SpriteIcon as Icon } from '../../icons/Icon';
import { useScroller } from '../../layout/util/Scroller';

import './Accordion.scss';

type AccordionItem = {
  title?: React.ReactNode,
  content?: React.ReactNode,
  openByDefault?: boolean,
  className?: ClassNameArgument,
};

export type AccordionProps = ComponentPropsWithoutRef<'ul'> & {
  items: Array<AccordionItem>,
  size?: 'normal' | 'small',
  className?: ClassNameArgument,
};

export const Accordion = ({ items, size = 'normal', className, ...propsRest }: AccordionProps) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const handleToggle = (index: number): void => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };
  
  React.useEffect(() => {
    const openByDefaultIndex = items.findIndex(item => item.openByDefault);
    if (openByDefaultIndex !== undefined) {
      setActiveIndex(openByDefaultIndex);
    }
  }, []);

  return (
    <ul
      data-label="bkl-accordion"
      className={cx('bkl-accordion', className, {
        'bkl-accordion--normal': size === 'normal',
        'bkl-accordion--small': size === 'small',
      })}
      {...propsRest}
    >
      {items.map((item, index) => (
        <AccordionItem
          onToggle={() => handleToggle(index)}
          active={activeIndex === index}
          key={index}
          index={index}
          item={item}
        />
      ))}
    </ul>
  );
};

type AccordionItemProps = {
  item: AccordionItem,
  active: boolean,
  index: number,
  onToggle: () => void,
};

const AccordionItem = ({ item, active, index, onToggle }: AccordionItemProps) => {
  const { title = '', content = '', className = '' } = item;

  const scrollerProps = useScroller();
  const contentEl = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (!contentEl.current) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      setHeight(active ? contentEl.current?.offsetHeight ?? 0 : 0);
    });

    resizeObserver.observe(contentEl.current);

    return () => resizeObserver.disconnect();
  }, [active]);

  return (
    <li
      className={cx('bkl-accordion-item', className, {
        'bkl-accordion-item--active': active,
      })}
      key={title}
      data-accordion-item={`accordion-item-${index}`}
    >
      <Button plain className="bkl-accordion-item__button" onClick={onToggle}>
        {title}
        <Icon
          className="bkl-accordion-item__state-indicator"
          name="arrow-expand"
          icon={import('../../../assets/icons/arrow-expand.svg?sprite')}
        />
      </Button>
      {contentEl &&
        <div
          className="bkl-accordion-item__wrapper"
          style={{ height: `${height}px` }}
        >
          <div
            ref={contentEl}
            className={cx('bkl-accordion-item__content', scrollerProps.className)}
          >
            {content}
          </div>
        </div>
      }
    </li>
  );
};
Accordion.displayName = 'Accordion';
