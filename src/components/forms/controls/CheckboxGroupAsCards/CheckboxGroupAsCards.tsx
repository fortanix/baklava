/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useEffectOnce } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { CardAction } from '../../../actions/CardAction/CardAction.tsx';
import { H5 } from '../../../../typography/Heading/Heading.tsx';

import cl from './CheckboxGroupAsCards.module.scss';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as CheckboxGroupAsCardsClassNames };


export type CardKey = string;
export type CardDef = {
  cardKey: CardKey,
  checkboxRef: React.RefObject<null | React.ComponentRef<typeof CardAction>>,
};

export type CheckboxGroupAsCardsContext = {
  register: (cardDef: CardDef) => () => void,
  selectedCards: ReadonlySet<CardKey>,
  selectCard: (cardKey: CardKey) => void,
  disabled: boolean,
};

export const CheckboxGroupAsCardsContext = React.createContext<null | CheckboxGroupAsCardsContext>(null);
export const useCheckboxGroupAsCardsContext = (cardDef: CardDef) => {
  const context = React.use(CheckboxGroupAsCardsContext);
  if (context === null) { throw new Error(`Missing CheckboxGroupAsCardsContext provider`); }

  React.useEffect(() => {
    return context.register(cardDef);
  }, [context.register, cardDef]);

  return context;
};


type CheckboxGroupCardProps = ComponentProps<typeof CardAction> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The unique key of this card within the checkbox group. */
  cardKey: CardKey,

  /** The title of the card, to be displayed in the under the segmented control. */
  title: React.ReactNode,

  /** The name of the icon to display or customIcon. */
  icon?: undefined | React.ReactElement,

  /** Escape hatch. */
  children?: undefined | React.ReactNode,
};

const CheckboxGroupCard = (props: CheckboxGroupCardProps) => {
  const {
    cardKey,
    title,
    icon,
    children,
    ...propsRest
  } = props;

  const checkboxRef = React.useRef<React.ComponentRef<typeof CardAction>>(null);
  const cardDef = React.useMemo<CardDef>(() => ({ cardKey, checkboxRef }), [cardKey]);

  const context = useCheckboxGroupAsCardsContext(cardDef);

  const isSelected = context.selectedCards.has(cardKey);
  const headingId = React.useId();
  return (
    <CardAction
      {...propsRest}
      className={cx(
        propsRest.className,
        cl['bk-checkbox-group-as-cards__card'],
        { [cl['bk-checkbox-group-as-cards__card--selected']]: isSelected },
      )}
      selected={isSelected}
      onClick={() => { context.selectCard(cardKey); }}
    >
      {isSelected && (
        <div className={cx(cl['bk-checkbox-group-as-cards__indicator'])}>
          <Icon icon="check" />
        </div>
      )}
      <H5 id={headingId} className={cl['bk-checkbox-group-as-cards__card__heading']}>
        {icon && (<span className={cx('_icon', cl['bk-checkbox-group-as-cards__icon'])}>{icon}</span>)}
        {/* biome-ignore lint/a11y/useSemanticElements: custom checkbox on span requires ARIA role */}
        <span
          ref={checkboxRef}
          role="checkbox"
          aria-checked={isSelected}
          aria-labelledby={headingId}
          tabIndex={isSelected ? 0 : -1}
          className={cx('_content', cl['bk-checkbox-group-as-cards__content'])}>
          {title}
        </span>
      </H5>
      {children}
    </CardAction>
  );
};

export type CheckboxGroupAsCardsProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The default cards to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | Array<CardKey>,

  /** The cards to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Array<CardKey>,

  /** Event handler for checkbox group change events. */
  onUpdate?: undefined | ((cardKeys: Array<CardKey>) => void),

  /** Whether the checkbox group is disabled or not. Default: false. */
  disabled?: undefined | boolean,

  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
};
/**
 * A checkbox group is a set of cards where multiple cards can be selected at the same time.
 */
export const CheckboxGroupAsCards = Object.assign(
  (props: CheckboxGroupAsCardsProps) => {
    const {
      children,
      unstyled = false,
      defaultSelected = [],
      selected,
      disabled = false,
      onUpdate,
      inputProps = {},
      ...propsRest
    } = props;

    if (typeof selected !== 'undefined' && !onUpdate) {
      console.warn(`Using CheckboxGroupAsCards as a controlled component, but missing 'onChange' callback.`);
    }

    const cardDefsRef = React.useRef<Map<CardKey, CardDef>>(new Map());
    const [selectedCards, setSelectedCards] = React.useState<Array<CardKey>>(selected ?? defaultSelected);

    // Sync `selected` prop to internal state.
    React.useEffect(() => {
      if (typeof selected !== 'undefined') {
        setSelectedCards(selected);
      }
    }, [selected]);

    //TODO: this register callback won't work if two already-rendered items are swapped.
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
      setSelectedCards(previousSelectedCards => {
        const isSelected = previousSelectedCards.includes(cardKey);
        const nextSelectedCards = isSelected
          ? previousSelectedCards.filter(selectedCard => selectedCard !== cardKey)
          : [...previousSelectedCards, cardKey];

        onUpdate?.(nextSelectedCards);
        return nextSelectedCards;
      });
    }, [onUpdate]);

    // After initial rendering, check whether `defaultSelected` refers to rendered cards.
    useEffectOnce(() => {
      for (const cardKey of defaultSelected) {
        const cardDef = cardDefsRef.current.get(cardKey);
        if (typeof cardDef === 'undefined' || cardDef.checkboxRef.current === null) {
          console.error(`Unable to find a card matching the specified defaultSelected: ${cardKey}`);
        } else if (!disabled && !isItemProgrammaticallyFocusable(cardDef.checkboxRef.current)) {
          console.error(`Default card is not focusable: ${cardKey}`);
        }
      }
    });

    const selectedCardsSet = React.useMemo(
      () => new Set(selectedCards),
      [selectedCards],
    );

    const context = React.useMemo<CheckboxGroupAsCardsContext>(() => ({
      register,
      selectedCards: selectedCardsSet,
      selectCard,
      disabled,
    }), [register, selectedCardsSet, selectCard, disabled]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      // Get the list of card keys in the order they are displayed.
      const cardKeys: Array<CardKey> = [...cardDefsRef.current.entries()]
        .filter(([_, { checkboxRef }]) => checkboxRef.current && isItemProgrammaticallyFocusable(checkboxRef.current))
        .map(([cardKey]) => cardKey);

      if (cardKeys.length === 0) { return; }

      const activeElement = document.activeElement;
      const activeCardIndex = cardKeys.findIndex(cardKey =>
        cardDefsRef.current.get(cardKey)?.checkboxRef.current === activeElement,
      );

      if (activeCardIndex < 0) { return; }

      // Space toggles the focused checkbox.
      if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
        event.preventDefault();

        const cardKey = cardKeys.at(activeCardIndex);

        if (cardKey === undefined) {
          return;
        }

        context.selectCard(cardKey);
        return;
      }

      // Arrow keys move focus without changing selection.
      const cardTarget = (() => {
        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowUp': {
            const cardIndex = activeCardIndex === 0 ? cardKeys.length - 1 : activeCardIndex - 1;
            return cardKeys.at(cardIndex) ?? null;
          }
          case 'ArrowRight':
          case 'ArrowDown': {
            const cardIndex = activeCardIndex + 1 >= cardKeys.length ? 0 : activeCardIndex + 1;
            return cardKeys.at(cardIndex) ?? null;
          }
          default:
            return null;
        }
      })();

      if (cardTarget !== null) {
        event.preventDefault();
        cardDefsRef.current.get(cardTarget)?.checkboxRef.current?.focus();
      }
    }, [context]);

    return (
      <CheckboxGroupAsCardsContext value={context}>
        <div
          role="group"
          aria-labelledby="checkbox-group-heading"
          aria-disabled={disabled}
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-checkbox-group-as-cards']]: !unstyled },
            { [cl['bk-checkbox-group-as-cards--disabled']]: disabled },
            propsRest.className,
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Hidden input, so that this component can be connected to a <form> element. */}
          <input type="hidden" {...inputProps} value={selectedCards.join(',')} onChange={undefined} />

          {children}
        </div>
      </CheckboxGroupAsCardsContext>
    );
  },
  {
    Card: CheckboxGroupCard,
  },
);
