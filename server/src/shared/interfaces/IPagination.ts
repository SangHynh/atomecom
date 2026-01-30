export interface IPagination {
  totalElements: number;
  totalPage: number;
  currentPage: number;
  elementsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: IPagination;
}