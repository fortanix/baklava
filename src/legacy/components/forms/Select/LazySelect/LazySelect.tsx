/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Popper from 'react-popper';
import * as PopperJS from '@popperjs/core';

import { classNames as cx, type ComponentProps } from '../../../../util/component_util.tsx';
import { useEffectAsync } from '../../../../util/hooks.ts';
import { useOutsideClickHandler } from '../../../../util/hooks/useOutsideClickHandler.ts';
import { useCombinedRefs } from '../../../../util/hooks/useCombinedRefs.ts';
import {
  findFirstFocusableIndex,
  handleOptionKeyDown,
  handleTriggerKeyDown
} from '../../../../util/keyboardHandlers.tsx';

import type { FieldQuery, FilterQuery } from '../../../../prefab/forms/MultiSearch/MultiSearch.tsx';

import { useScroller } from '../../../util/Scroller.tsx';
import { Caption } from '../../../typography/caption/Caption.tsx';
import { Tag } from '../../../containers/tag/Tag.tsx';
import { Button } from '../../../buttons/Button.tsx';
import { SelectPlaceholderSkeleton } from '../SelectPlaceholderSkeleton.tsx';

import '../Select.scss';


export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: typeof PopperJS.createPopper;
};

export type SelectOption = {
  label: React.ReactNode,
  disabled?: undefined | boolean,
};

export type LazySelectStatus = {
  ready: boolean, // Whether the data is ready to be used/shown in the UI
  loading: boolean, // Whether we're (re)loading the data
  error: null | Error, // Whether the last loading attempt resulted in an error
};

type PageIndex = number;

type UseLazySelectPageHistoryParams = {
  pageIndex: PageIndex,
  pageSize: number,
  filters: FilterQuery,
};

const useLazySelectPageHistory = <PageHistoryItem extends object>(params: UseLazySelectPageHistoryParams) => {
  const {
    pageSize,
    pageIndex,
    filters,
  } = params;

  // Note: conceptually the page history should be a stack. However, in order to prevent timing issues, we maintain
  // a map keyed with the page index, rather than an array. This allows us to handle situations where our local state
  // is out of sync with the actual table state.
  const [pageHistory, setPageHistory] = React.useState<Map<PageIndex, PageHistoryItem>>(() => new Map());
  
  const truncateToPage = React.useCallback(
    (pageHistory: Map<PageIndex, PageHistoryItem>, pageIndex: PageIndex) => {
      const keys = [...pageHistory.keys()];
      if (keys.length === 0 || keys[keys.length - 1] === pageIndex) {
        return pageHistory; // Don't update if we don't need to (optimization)
      } else {
        return new Map([...pageHistory.entries()].filter(([pageIndexCurrent]) => pageIndexCurrent <= pageIndex));
      }
    },
    [],
  );
  
  // Present an interface conceptually similar to a stack, but also take explicit page indices for consistency checking
  const pageHistoryApi = {
    clear() {
      setPageHistory(new Map());
    },
    pop(pageIndex: PageIndex) {
      setPageHistory(pageHistory => truncateToPage(pageHistory, pageIndex));
    },
    push(pageIndex: PageIndex, pageHistoryItem: PageHistoryItem) {
      setPageHistory(pageHistory => {
        const indices = [...pageHistory.keys()];
        const lastIndex: undefined | PageIndex = indices[indices.length - 1];
        // Make sure the page indices are contiguous
        if (pageIndex > lastIndex + 1) {
          throw new Error(`Non-contiguous page indices`); // Should never happen
        }
        
        return new Map(pageHistory).set(pageIndex, pageHistoryItem);
      });
    },
    peak(pageIndex: PageIndex): undefined | PageHistoryItem {
      return pageHistory.get(pageIndex);
    },
  };
  
  // Clear the history and go back to the first page, when page size, sorting, or filtering changes
  React.useEffect(
    () => {
      if (pageIndex > 0) {
        pageHistoryApi.clear();
        // table.gotoPage(0);
      }
    },
    [pageSize, filters],
  );
  
  return pageHistoryApi;
};

export type LazySelectQueryResult<D extends object, P extends unknown = undefined> = {
  itemsPage: Array<D>,
  pageState?: P, // Custom page state to be stored in page history
};

export type LazySelectQuery<D extends object, P extends unknown = undefined> =
  (params: {
    previousItem: null | D,
    previousPageState?: undefined | P,
    offset: number,
    pageSize: number,
    limit: number, // Note: the `limit` may be different from the `pageSize` (`limit` may include a +1 overflow)
    filters: FilterQuery,
  }) => Promise<LazySelectQueryResult<D, P>>;

type UseLazySelectQueryParams<D extends object, P extends unknown = undefined> = {
  isActive: boolean,
  pageIndex: number,
  pageSize: number,
  filters: FilterQuery,
  query?: LazySelectQuery<D, P>,
  setStatus: React.Dispatch<React.SetStateAction<LazySelectStatus>>,
  handleResult: (status: LazySelectStatus, items: Array<D>, isEndOfStream: boolean) => void,
};

const useLazySelectQuery = <D extends object, P extends unknown = undefined>(
  {
    isActive,
    pageIndex,
    pageSize,
    filters,
    query,
    setStatus,
    handleResult,
  }: UseLazySelectQueryParams<D, P>,
  deps: Array<unknown> = [],
) => {
  type PageHistoryItem = {
    itemLast: null | D, // Possibly `null` if there are no items yet (or loading)
    pageState?: P,
  };

  const pageHistory = useLazySelectPageHistory<PageHistoryItem>({
    pageIndex,
    pageSize,
    filters,
  });

  // Keep track of the latest query being performed
  const latestQuery = React.useRef<null | Promise<LazySelectQueryResult<D, P>>>(null);
  
  // Whenever any relevant table state is updated, requery the data
  useEffectAsync(async () => {
    if (!isActive || !query) {
      // Prevent executing query when dropdown state is not active.
      return;
    }
    // Get the previous page state (if any)
    const previousPage: null | PageHistoryItem = pageHistory.peak(pageIndex - 1) ?? null;
    
    let queryPromise;
    try {
      setStatus(status => ({ ...status, loading: true, error: null }));
      
      queryPromise = query({
        previousItem: previousPage?.itemLast ?? null,
        previousPageState: previousPage?.pageState ?? undefined,
        offset: pageIndex * pageSize,
        pageSize,
        limit: pageSize + 1, // Add +1 overflow for end-of-stream checking
        filters,
      });
      latestQuery.current = queryPromise;
      const { itemsPage: itemsWithOverflow, pageState } = await queryPromise;
      
      // Note: only update if we haven't been "superseded" by a more recent update
      if (latestQuery.current !== null && latestQuery.current === queryPromise) {
        const items = itemsWithOverflow.slice(0, pageSize); // Slice it down to at most one page length
        const isEndOfStream = itemsWithOverflow.length <= pageSize; // If there's more than a page length, must be EOS
        
        const status = { ready: true, loading: false, error: null };
        setStatus(status);
        handleResult(status, items, isEndOfStream);
        
        if (!isEndOfStream) {
          const itemLast = items.slice(-1)[0];
          pageHistory.push(pageIndex, { itemLast, pageState });
        }
      }
    } catch (reason: unknown) {
      console.error(reason);
      
      if (latestQuery.current !== null && latestQuery.current === queryPromise) {
        const error = reason instanceof Error ? reason : new Error('Unknown error');
        const status = { ready: false, loading: false, error };
        setStatus(status);
        //handleResult(status, [], false); // XXX Don't call `handleResult` when failed, or it messes up pagination
      }
    }
  }, [
    isActive,
    query,
    pageIndex,
    pageSize,
    JSON.stringify(filters),
    JSON.stringify({ ...deps }),
  ]);
};

export type LazySelectProps<
  D extends object, P extends unknown = undefined
> = Omit<ComponentProps<'div'>, 'onSelect'> & {
  getItemId: (item: D) => string,
  onSelect: (item: D) => void,
  resetItems: () => void,
  items: Array<D>,
  updateItems: (items: Array<D>) => void,
  selectedItem: null | D,
  pageSize?: number,
  renderLabel: (item: D) => string | React.ReactElement,
  getSelectedValue: (item: D | null) => string,
  disabled?: boolean,
  query?: LazySelectQuery<D, P>,
  filters?: FilterQuery,
  updateFilters?: (filters: FilterQuery) => void,
  placeholderEmpty?: React.ReactNode,
  ariaLabel?: string,
  placement?: PopperOptions['placement'],
  offset?: [number, number],
  popperOptions?: PopperOptions,
  renderEndOfStream?: () => React.ReactNode,
  isLoading?: boolean,
  dropdownReference?: React.RefObject<HTMLUListElement>,
  isFocusTrapActive?: boolean,
};

const initializeStatus = () => ({
  ready: false,
  loading: false,
  error: null,
});

export const LazySelect = <D extends object, P extends unknown = undefined>(props: LazySelectProps<D, P>) => {
  const observer = React.useRef<IntersectionObserver>(); // Used to save the observer created by IntersectionObserver

  const {
    getItemId,
    onSelect,
    resetItems,
    items,
    updateItems,
    selectedItem,
    pageSize: pageSizeParam,
    renderLabel,
    getSelectedValue,
    className = '',
    disabled = false,
    query,
    filters = [],
    updateFilters,
    placeholder = 'Select',
    placeholderEmpty,
    ariaLabel,
    placement = 'bottom',
    offset = [],
    popperOptions = {},
    renderEndOfStream,
    isLoading: _isLoading,
    dropdownReference,
    isFocusTrapActive = true,
    ...restProps
  } = props;

  const scrollerProps = useScroller();
  const optionsRef = React.useRef<HTMLButtonElement[]>([]);
  const pageSize = pageSizeParam && Number.isInteger(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 10;
  const [status, setStatus] = React.useState<LazySelectStatus>(initializeStatus);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [endOfStream, setEndOfStream] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const [isOptionSelected, setIsOptionSelected] = React.useState(false);
  const [searchQuery, updateSearchQuery] = React.useState('');
  const [filterBuffer, setFilterBuffer] = React.useState<FilterQuery>(filters ?? []);
  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null);
  
  const isLoading = _isLoading ?? status.loading;
  const selectedItemId = selectedItem ? getItemId(selectedItem) : null;

  //Infinite scroll logic
  const lastItemRef = React.useCallback(node => {
    // This ref should always target the last element in the list
    if (isLoading || !isActive || endOfStream) {
      return;
    }

    if (observer.current) {
      // Disconnecting the existing observer from the previously considered last item,
      // as there might be a new items added to the list.
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      const lasItem = entries[0];
      if (lasItem.isIntersecting) {
        // onScrollEnd?.(lasItem.target.getAttribute('data-key') ?? '' as string)
        setPageIndex(index => index + 1);
      }
    }, {
      root: dropdownRef.current,
    });

    if (node) {
      // Connecting observer to the new last item
      observer.current.observe(node);
    }
  }, [isLoading, isActive, endOfStream]);

  const widthModifiers = React.useMemo(() => [
    {
      name: 'width',
      enabled: true,
      fn: ({ state }: { state: PopperJS.State }) => {
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      effect: ({ state }: { state: PopperJS.State }) => {
        state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
      },
      phase: 'beforeWrite',
      requires: ['computeStyles'],
    },
  ], [isLoading]);

  const popper = Popper.usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'preventOverflow', enabled: true },
      { name: 'offset', options: offset },
      ...(widthModifiers || []),
      ...(popperOptions.modifiers || []),
    ],
    placement,
  });
  
  const dropdownRef = { current: popperElement };
  const toggleRef = { current: referenceElement };
  const combinedRefs = useCombinedRefs(dropdownReference, setPopperElement);

  useOutsideClickHandler([dropdownRef, toggleRef], () => {
    setIsActive(false);
  });
  
  useLazySelectQuery<D, P>({
    isActive,
    pageIndex,
    pageSize,
    filters: filterBuffer,
    query,
    setStatus,
    handleResult: (status, items, isEndOfStream) => {
      if (status.ready) {
        if (items.length === 0 && pageIndex > 0) {
          // Edge case: no items and yet we are not on the first page. This should not happen, unless something changed
          // between the end-of-stream check and the subsequent query. If it happens, navigate back to the previous
          // page.
          // Note: no need to perform a `setPageCount` here, because navigating to previous will trigger a new query,
          // which will perform a new end-of-stream check.
          // table.previousPage();
          setEndOfStream(true);
        } else if (isEndOfStream) {
          setEndOfStream(true);
        } else {
          setEndOfStream(false);
        }
      }

      updateItems(items);
    },
  }, []);

  React.useEffect(() => {
    // Resetting page index and data as filters have been updated
    resetItems();
    setPageIndex(0);
    updateFilters?.(filterBuffer);
  }, [JSON.stringify(filterBuffer)]);

  React.useEffect(() => {
    if (!isActive) {
      // Handle reset
      resetItems();
      setPageIndex(0);
      setStatus(initializeStatus());
      updateSearchQuery('');
      setFilterBuffer([...filters]);
    }
  }, [isActive]);
  
  // due to the lazy loading, handling focus on select item after item is loaded
  React.useEffect(() => {
    if (isActive && items.length > 0) {
      const { scrollX, scrollY } = window;
      const selectedIndex = optionsRef.current.findIndex(item => item?.getAttribute('aria-selected') === 'true');
      const focusIndex = selectedIndex === -1 ? findFirstFocusableIndex(optionsRef.current) : selectedIndex;
      optionsRef.current[focusIndex]?.focus();
      optionsRef.current[focusIndex]?.scrollIntoView({ block: 'nearest' });
      window.scrollTo(scrollX, scrollY);
    }
  }, [isActive, items]);

  const onContainerClick = () => {
    if (!disabled && !isActive) {
      // Do not toggle dropdown active state
      setIsActive(true);
    }
  };

  const onOptionClick = (selectedItem: D) => {
    onSelect(selectedItem);
    setIsActive(false);
    setIsOptionSelected(true);
  };

  const renderOptions = () => {
    return items.map((item, index) => {
      const itemId = getItemId(item);
      const isSelected = selectedItemId === itemId;

      return (
        <li
          key={itemId}
          role="presentation"
          {...(typeof query !== 'undefined' && items.length === index + 1) ? {
            ref: lastItemRef,
          } : {}}
          data-label="bkl-select-option"
          data-key={itemId}
        >
          <Button
            plain
            id={itemId}
            ref={el => (optionsRef.current[index] = el)}
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={cx(
              'bkl-select__option bkl-select__option--default', {
                'bkl-select__option--selected': isSelected,
              },
            )}
            onClick={() => { onOptionClick({ ...item }); }}
            onKeyDown={evt => {
              handleOptionKeyDown({
                evt,
                index,
                options: optionsRef.current,
                triggerElement: referenceElement,
                onSelect: () => onOptionClick({ ...item }),
                onClose: () => setIsActive(false),
              });
            }}
          >
            {renderLabel(item)}
          </Button>
        </li>
      );
    });
  };
  
  const renderDropdown = () => {
    return (
      <ul
        ref={combinedRefs}
        id="lazy-select-listbox"
        role="listbox"
        className={cx(
          'bkl-select__dropdown',
          'bkl-select__dropdown--lazy',
          { 'bkl-select__dropdown--empty': isEmpty },
          scrollerProps.className,
        )}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        {renderOptions()}
        {renderEndOfStream?.()}

        {isEmpty &&
          <li key="empty" role="presentation">
            <Button
              plain
              className="bkl-select__option bkl-select__option--empty"
              onKeyDown={(evt: React.KeyboardEvent) => {
                if (evt.key === 'Escape') {
                  setIsActive(false);
                }
              }}
            >
              {placeholderEmpty || <Caption>No result found</Caption>}
            </Button>
          </li>
        }

        {isLoading &&
          <SelectPlaceholderSkeleton />
        }
      </ul>
    );
  };

  const getSearchFilterValue = (filter: FieldQuery) => {
    return filter?.operation?.$text?.$search ?? '';
  };

  const onRemoveTag = (filterText: string) => {
    const updatedFilterBuffer = filterBuffer.filter(item => {
      return getSearchFilterValue(item) !== filterText;
    });

    setFilterBuffer([...updatedFilterBuffer]);
  };

  const getTags = () => {
    return filterBuffer.filter(item => item?.fieldName === '');
  };

  const hasTags = getTags().length;

  const renderTags = () => (
    getTags().map((tag, index) => {
      return (
        <Tag
          key={index}
          className="bkl-lazy-select__tag"
          onClose={(evt: React.MouseEvent<HTMLButtonElement>) => {
            // Prevent firing click handlers of select container which will close the dropdown
            evt.stopPropagation();
            onRemoveTag?.(getSearchFilterValue(tag));
          }}
          primary
          small
        >
          {tag?.operation?.$text?.$search ?? ''}
        </Tag>
      );
    })
  );

  const renderInput = () => (
    <input
      type="text"
      tabIndex={-1}
      className={cx(
        'bkl-select__input', {
          'bkl-select__input--changed': isOptionSelected,
          'bkl-select__input--disabled': disabled,
          'bkl-select__input--active': isActive,
        },
      )}
      placeholder={!isActive ? placeholder : 'Search'}
      value={!isActive ? getSelectedValue(selectedItem) : searchQuery}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
        if (isActive) {
          updateSearchQuery(evt.target.value);
        }
      }}
      onKeyDown={(evt: React.KeyboardEvent) => {
        if (isActive && evt.key === 'Enter') {
          evt.preventDefault();
          const filterText = searchQuery.trim();
          const isExisting = filterBuffer.some(item => {
            return item?.fieldName === '' && getSearchFilterValue(item) === filterText;
          });

          if (filterText && !isExisting) {
            setFilterBuffer(filters => [...filters, {
              fieldName: '',
              operation: {
                '$text': {
                  '$search': filterText,
                },
              },
            }]);
          }

          updateSearchQuery('');
        } else if (searchQuery === '' && evt.key === 'Backspace') {
          // pop filter tag
          const updatedFilterbuffer = filterBuffer.slice(0, -1);
          setFilterBuffer([...updatedFilterbuffer]);
        }
      }}
      {...!isActive ? { readOnly: true } : {}}
    />
  );

  const isEmpty = isActive && !isLoading && items.length === 0;

  return (
    <div {...restProps} className={cx('bkl bkl-select bkl-lazy-select', className)}>
      <Button
        plain
        className={cx(
          'bkl-select__container',
          'bkl-lazy-select__search-container',
          {
            'bkl-lazy-select__search-container--active': isActive,
            'bkl-lazy-select__search-container-with-tags': isActive && hasTags,
          },
        )}
        aria-haspopup="listbox"
        aria-expanded={isActive}
        aria-controls="lazy-select-listbox"
        aria-activedescendant={selectedItemId}
        role="combobox"
        onClick={onContainerClick}
        ref={setReferenceElement}
        onKeyDown={evt => {
          if (searchQuery !== '' && evt.key !== ' ') {
            handleTriggerKeyDown({
              evt,
              options: optionsRef?.current,
              onOpen: () => setIsActive(true),
              onClose: () => setIsActive(false),
            });
          }
        }}
      >
        {renderTags()}
        <i // FIXME: replace with <Icon/>
          className={cx(
            'bkl-select__caret bkl-caret bkl-caret--down', { 'bkl-select__caret--disabled': disabled },
          )}
        />
        {renderInput()}
      </Button>
      {isActive && ReactDOM.createPortal(renderDropdown(), document.body)}
    </div>
  );
};
