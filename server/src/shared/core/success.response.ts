import { type Response } from 'express';
import appConfig from '@config/app.config.js';

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
  execution_time?: string;
  pagination?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
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
      ...metadata,
    };
  }

  public send(
    res: Response,
    headers: Record<string, string | string[]> = {},
  ): Response {
    const traceId = (res as any).req?.traceId;
    if (traceId) {
      this.metadata.trace_id = traceId;
    }

    if (Object.keys(headers).length > 0) {
      res.set(headers);
    }
    return res.status(this.code).json(this);
  }
}

// ===== SPECIFIC SUCCESS CLASSES =====
export class OK<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'Success',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.OK, data, metadata });
  }
}

export class Created<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'Created successfully!',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.CREATED, data, metadata });
  }
}

export class Accepted<T = any> extends SuccessResponse<T> {
  constructor({
    message = 'Request accepted and being processed',
    data,
    metadata,
  }: Partial<SuccessResponseArgs<T>> = {}) {
    super({ message, status: SUCCESS_CODE.ACCEPTED, data, metadata });
  }
}

export class NoContent extends SuccessResponse<null> {
  constructor(message: string = 'No content') {
    super({ message, status: SUCCESS_CODE.NO_CONTENT, data: null });
  }
}
