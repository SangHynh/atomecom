export interface Pagination {
  totalElements: number;
  totalPage: number;
  currentPage: number;
  elementsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}
