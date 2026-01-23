import {type Response } from 'express';

// ===== HTTP SUCCESS CODE =====
const SUCCESS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
} as const;

// ===== INTERFACES =====
interface SuccessResponseArgs<T> {
  message: string;
  status?: number;
  metadata?: T;
}

// ===== BASE SUCCESS =====
class SuccessResponse<T = any> {
  public readonly status: string;
  public readonly code: number;
  public readonly message: string;
  public readonly metadata: T | any;
  public readonly timestamp: string;

  constructor({ message, status = SUCCESS_CODE.OK, metadata = {} as T }: SuccessResponseArgs<T>) {
    this.status = 'success';
    this.code = status;
    this.message = message;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  public send(res: Response, headers: Record<string, string | string[]> = {}): Response {
    if (Object.keys(headers).length > 0) {
      res.set(headers); 
    }
    return res.status(this.code).json(this);
  }
}

// ===== SPECIFIC SUCCESS CLASSES =====
export class OK<T = any> extends SuccessResponse<T> {
  constructor(message: string = 'Success', metadata: T = {} as T) {
    super({ message, status: SUCCESS_CODE.OK, metadata });
  }
}

export class Created<T = any> extends SuccessResponse<T> {
  constructor(message: string = 'Created successfully!', metadata: T = {} as T) {
    super({ message, status: SUCCESS_CODE.CREATED, metadata });
  }
}

export class Accepted<T = any> extends SuccessResponse<T> {
  constructor(message: string = 'Request accepted and being processed', metadata: T = {} as T) {
    super({ message, status: SUCCESS_CODE.ACCEPTED, metadata });
  }
}

export class NoContent extends SuccessResponse<null> {
  constructor(message: string = 'No content') {
    super({ message, status: SUCCESS_CODE.NO_CONTENT, metadata: null });
  }
}