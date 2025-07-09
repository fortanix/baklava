/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*
import * as React from 'react';
import { ClassNameArgument, classNames as cx } from '../../../../util/component_util';
import { useEffectAsync } from '../../../../util/hooks';

import { Button } from '../../../buttons/Button';
import { BaklavaIcon } from '../../../icons/icon-pack-baklava/BaklavaIcon';
import { SearchInput } from '../../../../prefab';

import { MultiAssignerStatus } from '../MultiAssignerContext';


export type MultiAssignerQueryResult<D extends object> = { items: Array<D> };

type UseQueryParams<D extends object> = {
  query: MultiAssignerQuery<D>,
  queryParams: MultiAssignerQueryParams,
  status: MultiAssignerStatus,
  setStatus: React.Dispatch<React.SetStateAction<MultiAssignerStatus>>,
  handleResult: (result: MultiAssignerQueryResult<D>) => void,
};

const useQuery = <D extends object>(
  { queryParams, query, status, setStatus, handleResult }: UseQueryParams<D>,
  deps: Array<unknown> = [],
) => {
  // Keep track of the latest query being performed
  const latestQuery = React.useRef<null | Promise<MultiAssignerQueryResult<D>>>(null);
  
  useEffectAsync(async () => {
    try {
      setStatus(status => ({ ...status, loading: true, error: null }));
      
      const queryPromise = query({
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize,
        limit: queryParams.limit,
        sorting: queryParams.sorting,
      });

      latestQuery.current = queryPromise;
      const queryResult = await queryPromise;
      
      // Note: only update if we haven't been "superseded" by a more recent update
      if (latestQuery.current !== null &&
        latestQuery.current === queryPromise) {
        setStatus({ ready: true, loading: false, error: null });
        handleResult(queryResult);
      }
    } catch (reason: unknown) {
      console.error(reason);
      const error = reason instanceof Error ? reason : new Error('Unknown error');
      setStatus({ ready: false, loading: false, error });
    }
  }, [
    setStatus,
    query,
    ...deps,
  ]);
};

export type MultiAssignerQueryConfig = {
  pageSize: number,
  limit?: number,
  sorting?: { property: string, direction: 'ASC' | 'DESC' },
};

export type MultiAssignerQueryParams = MultiAssignerQueryConfig & {
  pageIndex: Number
};
export type MultiAssignerQuery<D extends object> =
  (params: MultiAssignerQueryParams) => Promise<MultiAssignerQueryResult<D>>;

export type MultiAssignerProviderLazyProps<D extends object> = MultiAssignerProps & {
  query: MultiAssignerQuery<D>,
  queryConfig?: MultiAssignerQueryConfig,
  updateItems: (items: MultiAssignerQueryResult<D>) => void,
};


export const MultiAssignerLazy = <D extends object>(props: MultiAssignerProviderLazyProps<D>) => {
  const { query, queryConfig, updateItems } = props;
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  
  const [status, setStatus] = React.useState<MultiAssignerStatus>({ ready: false, loading: false, error: null });
  
  const [reloadTrigger, setReloadTrigger] = React.useState(0);
  
  const reload = React.useCallback(() => {
    setReloadTrigger(trigger => (trigger + 1) % 100);
  }, [setReloadTrigger]);
  
  const queryParams = {
    ...(queryConfig ?? { pageSize: 10 }),
    pageIndex,
  };

  useQuery({
    queryParams,
    query,
    status,
    setStatus,
    handleResult: result => { updateItems(result); },
  }, [reloadTrigger]);

  return (<MultiAssigner {...props} />);
};
*/
