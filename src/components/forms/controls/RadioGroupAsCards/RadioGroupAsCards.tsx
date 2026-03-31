/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce, usePrevious } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { CardAction } from '../../../actions/CardAction/CardAction.tsx';
import { H5 } from '../../../../typography/Heading/Heading.tsx';

import cl from './RadioGroupAsCards.module.scss';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as RadioGroupAsCardsClassNames };


export type CardKey = string;
export type CardDef = {
  cardKey: CardKey,
  cardRef: React.RefObject<null | HTMLDivElement>,
};

export type RadioGroupAsCardsContext = {
  register: (cardDef: CardDef) => () => void,
  selectedCard: undefined | CardKey,
  selectCard: (cardKey: CardKey) => void,
};
export const RadioGroupAsCardsContext = React.createContext<null | RadioGroupAsCardsContext>(null);
export const useRadioGroupAsCardsContext = (cardDef: CardDef) => {
  const context = React.use(RadioGroupAsCardsContext);
  if (context === null) { throw new Error(`Missing RadioGroupAsCardsContext provider`); }

  React.useEffect(() => {
    return context.register(cardDef);
  }, [context.register, cardDef]);

  return context;
};


type RadioGroupCardProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The unique key of this card within the segmented control. */
  cardKey: CardKey,

  /** The title of the card, to be displayed in the under the segmented control. */
  title: React.ReactNode,

  /** The name of the icon to display or customIcon */
  icon?: undefined | React.ReactElement,

  /** Escape hatch */
  children?: React.ReactNode,
};

const RadioGroupCard = (props: RadioGroupCardProps) => {
  const {
    cardKey,
    title,
    icon,
    children,
    ...propsRest
  } = props;

  const cardRef = React.useRef<HTMLDivElement>(null);

  const cardDef = React.useMemo(
    () => ({
      cardKey: cardKey,
      cardRef: cardRef, // matches Card ref shape
    }),
    [cardKey]
  );

  const context = useRadioGroupAsCardsContext(cardDef);

  const isSelected = context.selectedCard === cardKey;
  return (
    <div
      className={cx(
        cl['bk-radio-group-as-cards__card-wrapper'],
        { [cl['bk-radio-group-as-cards__card-wrapper--selected']]: isSelected },
      )}
    >
      <CardAction
        {...propsRest}
        className={cx(
          propsRest.className,
          cl['bk-radio-group-as-cards__card'],
          { [cl['bk-radio-group-as-cards__card--selected']]: isSelected },
        )}
        selected={isSelected}
        onClick={() => context.selectCard(cardKey)}
      >
        {isSelected && (
          <div className={cx(cl['bk-radio-group-as-cards__indicator'])}>
            <Icon icon="check" />
          </div>
        )}
        <H5 id={`${cardKey}-label`} className={cl['bk-radio-group-as-cards__card__heading']}>
          {icon && (<span className={cx('_icon', cl['bk-radio-group-as-cards__icon'])}>{icon}</span>)}
          {/* biome-ignore lint/a11y/useSemanticElements: custom radio on span requires ARIA role */}
          <span
            ref={mergeRefs(cardRef, propsRest.ref)}
            role="radio"
            aria-checked={isSelected}
            aria-labelledby={`${cardKey}-label`}
            tabIndex={isSelected ? 0 : -1}
            className={cx('_content', cl['bk-radio-group-as-cards__content'])}>
            {title}
          </span>
        </H5>
      </CardAction>
    </div>
  );
};

export type RadioGroupAsCardsProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The default card to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | CardKey,

  /** The card to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | CardKey,

  /** Event handler for segmented control card change events. */
  onUpdate?: undefined | ((cardKey: CardKey) => void),

  /** Whether the segmented control is disabled or not. Default: false. */
  disabled?: undefined | boolean,

  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
};
/**
 * A segmented control is a set of mutually exclusive cards that can be switched between.
 */
export const RadioGroupAsCards = Object.assign(
  (props: RadioGroupAsCardsProps) => {
    const {
      children,
      unstyled = false,
      defaultSelected,
      selected,
      disabled = false,
      onUpdate,
      inputProps = {},
      ...propsRest
    } = props;

    if (typeof selected !== 'undefined' && !onUpdate) {
      console.warn(`Using RadioGroupAsCards as uncontrolled component, but missing 'onChange' callback.`);
    }

    const cardDefsRef = React.useRef<Map<CardKey, CardDef>>(new Map());
    const [selectedCard, setSelectedCard] = React.useState<undefined | CardKey>(selected ?? defaultSelected);

    // Sync `selected` prop to internal state
    React.useEffect(() => {
      if (typeof selected !== 'undefined') {
        setSelectedCard(selected);
      }
    }, [selected]);

    const register = React.useCallback((cardDef: CardDef) => {
      const cardDefs = cardDefsRef.current;
      if (cardDefs.has(cardDef.cardKey)) {
        console.error(`Duplicate card key: ${cardDef.cardKey}`);
      } else {
        cardDefsRef.current.set(cardDef.cardKey, cardDef);
      }

      return () => {
        cardDefsRef.current.delete(cardDef.cardKey);
      };
    }, []);

    const selectCard = React.useCallback((cardKey: CardKey) => {
      setSelectedCard(selectedCard => {
        if (cardKey !== selectedCard) {
          cardDefsRef.current.get(cardKey)?.cardRef.current?.focus();
          return cardKey;
        } else {
          return selectedCard;
        }
      });
    }, []);

    const selectedCardPrev = usePrevious(selectedCard);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Do not include event callbacks as dep.
    React.useEffect(() => {
      // Note: selected state should be updated to `undefined`, the `undefined` case should only be possible as an
      // initial state. Subsequent updates should always be some value. Just like how native HTML radio groups work.
      const isDefined = typeof selectedCard !== 'undefined';
      const isInitial = selectedCardPrev === null; // `null` should only ever mean "not yet set"

      if (isDefined && !isInitial) {
        onUpdate?.(selectedCard);
      }
    }, [selectedCard]);

    // After initial rendering, check whether `defaultSelected` refers to one of the rendered cards
    useEffectOnce(() => {
      if (typeof defaultSelected === 'undefined') { return; }

      const cardDef: undefined | CardDef = cardDefsRef.current.get(defaultSelected);
      if (typeof cardDef === 'undefined' || cardDef.cardRef.current === null) {
        console.error(`Unable to find a card matching the specified defaultSelected: ${defaultSelected}`);
      } else if (!disabled && !isItemProgrammaticallyFocusable(cardDef.cardRef.current)) {
        console.error(`Default card is not focusable: ${defaultSelected}`);
      }
    });

    const context = React.useMemo<RadioGroupAsCardsContext>(() => ({
      register,
      selectedCard,
      selectCard,
      disabled,
    }), [register, selectedCard, selectCard, disabled]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      const selectedCard = context.selectedCard;
      if (typeof selectedCard === 'undefined') { return; }

      // Get the list of card keys, ideally in the order that they are displayed to the user.
      // Filter only the cards that are (programmatically) focusable.
      const cardKeys: Array<CardKey> = [...cardDefsRef.current.entries()]
        .filter(([_, { cardRef }]) => cardRef.current && isItemProgrammaticallyFocusable(cardRef.current))
        .map(([cardKey]) => cardKey);

      const cardIndex: number = cardKeys.indexOf(selectedCard);
      if (cardIndex < 0) {
        console.error(`Could not resolve selected card: '${selectedCard}'`);
      }

      // Determine the target card to focus based on the keyboard event (if any)
      const cardTarget = ((): null | CardKey => {
        switch (event.key) {
          case 'ArrowLeft': {
            const cardPrevIndex = cardIndex === 0 ? -1 : cardIndex - 1;
            const cardPrev: undefined | CardKey = cardKeys.at(cardPrevIndex);
            if (typeof cardPrev === 'undefined') { throw new Error(`Should not happen`); }
            return cardPrev;
          }
          case 'ArrowRight': {
            const cardNextIndex = cardIndex + 1 >= cardKeys.length ? 0 : cardIndex + 1;
            const cardNext: undefined | CardKey = cardKeys.at(cardNextIndex);
            if (typeof cardNext === 'undefined') { throw new Error(`Should not happen`); }
            return cardNext;
          }
          case 'ArrowUp': {
            const cardFirst: undefined | CardKey = cardKeys.at(0);
            if (typeof cardFirst === 'undefined') { throw new Error(`Should not happen`); }
            return cardFirst;
          }
          case 'ArrowDown': {
            const cardLast: undefined | CardKey = cardKeys.at(-1);
            if (typeof cardLast === 'undefined') { throw new Error(`Should not happen`); }
            return cardLast;
          }
          default: return null;
        }
      })();

      if (cardTarget !== null && cardTarget !== context.selectedCard) {
        event.preventDefault();
        context.selectCard(cardTarget);
      }
    }, [context]);

    return (
      <RadioGroupAsCardsContext value={context}>
        <div
          role="radiogroup"
          aria-required
          aria-orientation="horizontal"
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-radio-group-as-cards']]: !unstyled },
            { [cl['bk-radio-group-as-cards--disabled']]: disabled },
            propsRest.className,
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Hidden input, so that this component can be connected to a <form> element */}
          <input type="hidden" {...inputProps} value={selectedCard} onChange={undefined} />

          {children}
        </div>
      </RadioGroupAsCardsContext>
    );
  },
  {
    Card: RadioGroupCard,
  },
);
