import { SuccessResponse } from '@atomecom/shared';

/**
 * Extract inner data from SuccessResponse wrapper.
 * Useful with TanStack Query where `.data` is SuccessResponse<T>.
 */
export function extractData<T>(
  response: SuccessResponse<T> | null | undefined,
): T | null {
  return response?.data ?? null;
}

/**
 * Extract pagination metadata from SuccessResponse wrapper.
 */
export function extractPagination(
  response: SuccessResponse<unknown> | null | undefined,
) {
  const p = response?.metadata?.pagination;
  if (!p) return null;
  return {
    totalElements: p.total_items,
    totalPages: p.total_pages,
    currentPage: p.page,
    elementsPerPage: p.limit,
  };
}
