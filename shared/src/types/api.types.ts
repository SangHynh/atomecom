export interface MetaData {
  timestamp: string;
  version: string;
  trace_id?: string;
  execution_time?: string;
  pagination?: {
    total_items: number;
    total_pages: number;
    page: number;
    limit: number;
  };
}

export interface SuccessResponse<T = unknown> {
  status: string;
  code: number;
  message: string;
  metadata?: MetaData;
  data: T;
}

export interface ErrorResponse {
  status: string;
  statusCode: number | string;
  message: string;
  errors?: unknown[];
}

export interface Pagination {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  elementsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}
