/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce, usePrevious } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';

import { CardAction } from '../../../actions/CardAction/CardAction.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';

import cl from './SegmentedCardActionControl.module.scss';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as SegmentedCardActionControlClassNames };


export type CardKey = string;
export type CardDef = {
  cardKey: CardKey,
  cardRef: React.RefObject<null | React.ComponentRef<typeof CardAction>>,
};

export type SegmentedCardActionControlContext = {
  register: (cardDef: CardDef) => () => void,
  selectedCard: undefined | CardKey,
  selectCard: (cardKey: CardKey) => void,
};
export const SegmentedCardActionControlContext = React.createContext<null | SegmentedCardActionControlContext>(null);
export const useSegmentedCardActionControlContext = (cardDef: CardDef) => {
  const context = React.use(SegmentedCardActionControlContext);
  if (context === null) { throw new Error(`Missing SegmentedCardActionControlContext provider`); }

  React.useEffect(() => {
    return context.register(cardDef);
  }, [context.register, cardDef]);

  return context;
};


type SegmentedCardActionControlCardProps = ComponentProps<typeof CardAction> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The unique key of this card within the segmented control. */
  cardKey: CardKey;

  /** The title of the card, to be displayed in the under the segmented control. */
  title: React.ReactNode;

  /** The name of the icon to display or customIcon */
  icon: undefined | React.ReactElement,

  /** Escape hatch */
  children?: React.ReactNode;
};

const SegmentedCardActionControlCard = (props: SegmentedCardActionControlCardProps) => {
  const {
    cardKey,
    title,
    icon,
    children,
    ...propsRest
  } = props;

  const cardRef = React.useRef<React.ComponentRef<typeof CardAction>>(null);

  const cardDef = React.useMemo(
    () => ({
      cardKey: cardKey,
      cardRef: cardRef, // matches Card ref shape
    }),
    [cardKey]
  );

  const context = useSegmentedCardActionControlContext(cardDef);

  const isSelected = context.selectedCard === cardKey;

  return (
    <div
      className={cx(
        cl['bk-segmented-card-action-control__card-wrapper'],
        { [cl['bk-segmented-card-action-control__card-wrapper--selected']]: isSelected },
      )}
    >
      {isSelected && (
        <div className={cx(cl['bk-segmented-card-action-control__indicator'])}>
          <Icon icon="check" />
        </div>
      )}
      <CardAction
        {...propsRest}
        ref={mergeRefs(cardRef, propsRest.ref)}
        role="radio"
        aria-checked={isSelected}
        tabIndex={isSelected ? 0 : -1}
        selected={isSelected}
        onClick={() => {
          context.selectCard(cardKey);
        }}
        className={cx(
          propsRest.className,
          cl['bk-segmented-card-action-control__card-action'],
        )}
      >
        {children ? (
          children
        ) : (
          title && (
            <CardAction.Heading
              className={cx(cl['bk-segmented-card-action-control__card-action__heading'])}
              icon={icon}
            >
              {title}
            </CardAction.Heading>
          )
        )}
      </CardAction>
    </div>
  );
};

export type SegmentedCardActionControlProps = ComponentProps<'div'> & {
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
export const SegmentedCardActionControl = Object.assign(
  (props: SegmentedCardActionControlProps) => {
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
      console.warn(`Using SegmentedCardActionControl as uncontrolled component, but missing 'onChange' callback.`);
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

    const context = React.useMemo<SegmentedCardActionControlContext>(() => ({
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
      <SegmentedCardActionControlContext value={context}>
        <div
          role="radiogroup"
          aria-required
          aria-orientation="horizontal"
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-segmented-card-action-control']]: !unstyled },
            { [cl['bk-segmented-card-action-control--disabled']]: disabled },
            propsRest.className,
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Hidden input, so that this component can be connected to a <form> element */}
          <input type="hidden" {...inputProps} value={selectedCard} onChange={undefined} />

          {children}
        </div>
      </SegmentedCardActionControlContext>
    );
  },
  {
    Card: SegmentedCardActionControlCard,
  },
);
