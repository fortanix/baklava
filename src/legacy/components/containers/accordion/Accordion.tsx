/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../util/component_util.tsx';

import { Button } from '../../buttons/Button.tsx';
import { SpriteIcon as Icon } from '../../icons/Icon.tsx';
import { useScroller } from '../../util/Scroller.tsx';

import './Accordion.scss';


type AccordionItem = {
  title?: undefined | React.ReactNode,
  content?: undefined | React.ReactNode,
  openByDefault?: undefined | boolean,
  className?: undefined | ClassNameArgument,
};

export type AccordionProps = ComponentProps<'ul'> & {
  items: Array<AccordionItem>,
  size?: undefined | 'normal' | 'small',
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
  
  useEffectOnce(() => {
    const openByDefaultIndex = items.findIndex(item => item.openByDefault);
    if (openByDefaultIndex !== undefined) {
      setActiveIndex(openByDefaultIndex);
    }
  });
  
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
          // biome-ignore lint/suspicious/noArrayIndexKey: No other key available.
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
    if (!contentEl.current) { return undefined; }
    
    const resizeObserver = new ResizeObserver(() => {
      setHeight(active ? contentEl.current?.offsetHeight ?? 0 : 0);
    });
    
    resizeObserver.observe(contentEl.current);
    
    return () => resizeObserver.disconnect();
  }, [active]);
  
  return (
    <li
      key={index}
      className={cx(
        'bkl',
        'bkl-accordion-item',
        className,
        { 'bkl-accordion-item--active': active },
      )}
      data-accordion-item={`accordion-item-${index}`}
    >
      <Button plain className="bkl-accordion-item__button" onClick={onToggle}>
        {title}
        <Icon name="arrow-expand" className="bkl-accordion-item__state-indicator"/>
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
