import { type Response } from 'express';
import appConfig from '@config/app.config.js';
import type { PaginatedResult } from '@shared/interfaces/pagination.model.js';

// ===== HTTP SUCCESS CODE =====
const SUCCESS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
} as const;

// ===== INTERFACES =====
interface MetaData {
  timestamp: string;
  version: string;
  trace_id: string | null;
  execution_time?: string | null;
  pagination?: {
    total_items: number;
    total_pages: number;
    page: number;
    limit: number;
  };
}

interface SuccessResponseArgs<T> {
  message: string;
  status?: number;
  metadata?: Partial<MetaData> | undefined;
  data?: T | undefined;
}

// ===== BASE SUCCESS =====
class SuccessResponse<T = any> {
  public readonly status: string;
  public readonly code: number;
  public readonly message: string;
  public readonly data: T | null;
  public readonly metadata: Partial<MetaData>;

  constructor({
    message,
    status = SUCCESS_CODE.OK,
    data = null as any,
    metadata = {},
  }: SuccessResponseArgs<T>) {
    this.status = 'success';
    this.code = status;
    this.message = message;

    this.data = data ?? null;

    this.metadata = {
      timestamp: new Date().toISOString(),
      version: appConfig?.app?.version || '1.0.0',
      trace_id: null,
      execution_time: null,
      ...metadata,
    };
  }

  public send(
    res: Response,
    headers: Record<string, string | string[]> = {},
  ): Response {
    const req = (res as any).req;
    const traceId = req?.traceId;
    if (traceId) {
      this.metadata.trace_id = traceId;
      res.setHeader('x-trace-id', traceId);
    }
    if (Object.keys(headers).length > 0) {
      res.set(headers);
    }
    if (req?.startTime) {
      const duration = (performance.now() - req.startTime).toFixed(3);
      this.metadata.execution_time = `${duration}ms`;
    }
    return res.status(this.code).json(this);
  }
}

// ===== SPECIFIC SUCCESS CLASSES =====
export class OK<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'SUCCESS',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.OK, data, metadata });
  }

  public static withPagination<T>(res: Response, result: PaginatedResult<T>) {
    return new OK({
      message: 'SUCCESS',
      data: result.data,
      metadata: {
        pagination: {
          total_items: result.pagination.totalElements,
          total_pages: result.pagination.totalPage,
          page: result.pagination.currentPage,
          limit: result.pagination.elementsPerPage,
        },
      },
    }).send(res);
  }
}

export class Created<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'CREATED_SUCCESS',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.CREATED, data, metadata });
  }
}

export class Accepted<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'REQUEST_ACCEPTED',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.ACCEPTED, data, metadata });
  }
}

export class NoContent extends SuccessResponse<null> {
  constructor(message = 'NO_CONTENT') {
    super({ message, status: SUCCESS_CODE.NO_CONTENT, data: null });
  }
}
