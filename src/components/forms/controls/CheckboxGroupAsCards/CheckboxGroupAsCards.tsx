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
import { FieldSet } from '../../common/FieldSet/FieldSet.tsx';

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

  /** Whether this individual card is disabled. Default: false. */
  disabled?: boolean,
};

const CheckboxGroupCard = (props: CheckboxGroupCardProps) => {
  const {
    cardKey,
    title,
    icon,
    children,
    disabled: cardDisabled = false,
    ...propsRest
  } = props;

  const checkboxRef = React.useRef<React.ComponentRef<typeof CardAction>>(null);
  const cardDef = React.useMemo<CardDef>(() => ({ cardKey, checkboxRef }), [cardKey]);

  const context = useCheckboxGroupAsCardsContext(cardDef);

  const isSelected = context.selectedCards.has(cardKey);
  const isDisabled = context.disabled || Boolean(cardDisabled);
  const headingId = React.useId();
  return (
    <CardAction
      {...propsRest}
      className={cx(
        cl['bk-checkbox-group-as-cards__card'],
        {
          [cl['bk-checkbox-group-as-cards__card--selected']]: isSelected,
          [cl['bk-checkbox-group-as-cards__card--disabled']]: isDisabled,
        },
        propsRest.className,
      )}
      selected={isSelected}
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      onClick={() => {
        if (isDisabled) {
          return;
        }

        context.selectCard(cardKey);
      }}
    >
      {isSelected && (
        <div className={cx('bk-theme--dark', cl['bk-checkbox-group-as-cards__indicator'])}>
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
          aria-disabled={isDisabled}
          aria-labelledby={headingId}
          tabIndex={context.disabled ? -1 : 0}
          className={cx('_content', cl['bk-checkbox-group-as-cards__span-content'],
          )}
          onKeyDown={event => {
            if (isDisabled) {
              return;
            }

            if (event.key !== ' ' && event.key !== 'Spacebar') {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            context.selectCard(cardKey);
          }}
        >
          {title}
        </span>
      </H5>
      {children}
    </CardAction >
  );
};

export type CheckboxGroupAsCardsProps = ComponentProps<'fieldset'> & {
  /**The name used for the hidden inputs submitted with the form. */
  name?: string,

  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The human-readable label for the checkbox group. */
  label?: undefined | React.ReactNode,

  /** The default cards to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | Set<CardKey>,

  /** The cards to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<CardKey>,

  /** Event handler for checkbox group change events. */
  onSelectedChange?: undefined | ((cardKeys: Set<CardKey>) => void),

  /** Whether the checkbox group is disabled or not. Default: false. */
  disabled?: undefined | boolean,

  /** The orientation of the checkboxes, either vertical or horizontal. Default: 'horizontal'. */
  orientation?: undefined | 'vertical' | 'horizontal',

  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,

  /** A class name to apply on the inner checkbox group (rather than the outer fieldset). */
  contentClassName?: undefined | ComponentProps<typeof FieldSet>['contentClassName'],
};
/**
 * A checkbox group is a set of cards where multiple cards can be selected at the same time.
 */
export const CheckboxGroupAsCards = Object.assign(
  (props: CheckboxGroupAsCardsProps) => {
    const {
      children,
      name,
      label,
      unstyled = false,
      defaultSelected = new Set<CardKey>(),
      selected,
      disabled = false,
      onSelectedChange,
      orientation = 'horizontal',
      inputProps = {},
      contentClassName,
      ...propsRest
    } = props;

    if (typeof selected !== 'undefined' && !onSelectedChange) {
      console.warn(`Using CheckboxGroupAsCards as a controlled component, but missing 'onChange' callback.`);
    }

    const cardDefsRef = React.useRef<Map<CardKey, CardDef>>(new Map());
    const [selectedCards, setSelectedCards] = React.useState<Set<CardKey>>(() => new Set(selected ?? defaultSelected));

    // Sync `selected` prop to internal state.
    React.useEffect(() => {
      if (typeof selected !== 'undefined') {
        setSelectedCards(new Set(selected));
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
      if (disabled) {
        return;
      }
      setSelectedCards(previousSelectedCards => {
        const nextSelectedCards = new Set(previousSelectedCards);

        if (nextSelectedCards.has(cardKey)) {
          nextSelectedCards.delete(cardKey);
        } else {
          nextSelectedCards.add(cardKey);
        }

        onSelectedChange?.(new Set(nextSelectedCards));

        return nextSelectedCards;
      });
    }, [disabled, onSelectedChange]);

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


    const context = React.useMemo<CheckboxGroupAsCardsContext>(() => ({
      register,
      selectedCards,
      selectCard,
      disabled,
    }), [register, selectedCards, selectCard, disabled]);

    return (
      <CheckboxGroupAsCardsContext value={context}>
        <FieldSet
          {...propsRest}
          legend={label}
          disabled={disabled}
          className={cx(
            'bk',
            { [cl['bk-checkbox-group-as-cards']]: !unstyled },
            { [cl['bk-checkbox-group-as-cards--disabled']]: disabled },
            { [cl['bk-checkbox-group-as-cards--horizontal']]: orientation === 'horizontal' },
            { [cl['bk-checkbox-group-as-cards--vertical']]: orientation === 'vertical' },
            propsRest.className,
          )}
          contentClassName={cx(cl['bk-checkbox-group-as-cards__content'], contentClassName)}
        >
          {/* Hidden input, so that this component can be connected to a <form> element. */}
          {[...selectedCards].map(cardKey => (
            <input
              {...inputProps}
              key={cardKey}
              type="hidden"
              name={name ? `${name}[]` : undefined}
              value={cardKey}
              disabled={disabled}
            />
          ))}

          {children}
        </FieldSet>
      </CheckboxGroupAsCardsContext>
    );
  },
  {
    Card: CheckboxGroupCard,
  },
);
