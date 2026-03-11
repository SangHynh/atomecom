'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface TableParams {
  q?: string;
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  [key: string]: any;
}

/**
 * Hook to manage table state (pagination, search, filters) via URL Query Params.
 * This ensures state persists on refresh and supports browser back/forward.
 */
export function useTableParams(defaultParams: Partial<TableParams> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo<TableParams>(() => {
    const q = searchParams.get('q') || defaultParams.q || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(
      searchParams.get('limit') || String(defaultParams.limit || 10),
      10,
    );
    const sortField = searchParams.get('sortField') || defaultParams.sortField;
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') ||
      defaultParams.sortOrder;
    const status = searchParams.get('status') || defaultParams.status || 'all';

    const otherParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (
        !['q', 'page', 'limit', 'sortField', 'sortOrder', 'status'].includes(
          key,
        )
      ) {
        otherParams[key] = value;
      }
    });

    return {
      q,
      page,
      limit,
      sortField,
      sortOrder,
      status,
      ...otherParams,
    };
  }, [searchParams, defaultParams]);

  const setParams = useCallback(
    (newParams: Partial<TableParams>) => {
      const sp = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          value === 'all'
        ) {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      });

      // If page isn't explicitly set in newParams, reset to 1 when filters change
      // (Except if only page itself is changing)
      const keys = Object.keys(newParams);
      if (
        keys.length > 0 &&
        !keys.includes('page') &&
        !keys.every((k) => k === 'page')
      ) {
        sp.set('page', '1');
      }

      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    params,
    setParams,
    clearParams,
  };
}
