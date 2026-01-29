// ===== HTTP STATUS CODE =====
const STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ===== INTERFACES =====
interface AppErrorArgs {
  message: string;
  status: number;
  layer?: string;
  module?: string;
  errors?: any[];
}

// ===== BASE ERROR =====
export class AppError extends Error {
  public readonly status: number;
  public layer: string;
  public module: string;
  public errors: any[];
  constructor({
    message,
    status,
    layer = 'unknown',
    module = 'unknown',
    errors = [],
  }: AppErrorArgs) {
    super(message);
    this.status = status;
    this.layer = layer;
    this.module = module;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ===== CLIENT ERRORS =====
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors: any[] = []) {
    super({
      message: message || 'BAD_REQUEST',
      status: STATUS_CODE.BAD_REQUEST,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', errors: any[] = []) {
    super({
      message: message || 'UNAUTHORIZED',
      status: STATUS_CODE.UNAUTHORIZED,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', errors: any[] = []) {
    super({
      message: message || 'FORBIDDEN',
      status: STATUS_CODE.FORBIDDEN,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errors: any[] = []) {
    super({
      message: message || 'NOT_FOUND',
      status: STATUS_CODE.NOT_FOUND,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', errors: any[] = []) {
    super({
      message: message || 'CONFLICT',
      status: STATUS_CODE.CONFLICT,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Unprocessable entity', errors: any[] = []) {
    super({
      message: message || 'UNPROCESSABLE_ENTITY',
      status: STATUS_CODE.UNPROCESSABLE_ENTITY,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', errors: any[] = []) {
    super({
      message: message || 'TOO_MANY_REQUESTS',
      status: STATUS_CODE.TOO_MANY_REQUESTS,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

// ===== SERVER ERRORS =====

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', errors: any[] = []) {
    super({
      message: message || 'INTERNAL_SERVER_ERROR',
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string = 'Bad gateway', errors: any[] = []) {
    super({
      message: message || 'BAD_GATEWAY',
      status: STATUS_CODE.BAD_GATEWAY,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', errors: any[] = []) {
    super({
      message: message || 'SERVICE_UNAVAILABLE',
      status: STATUS_CODE.SERVICE_UNAVAILABLE,
      module: 'unknown',
      layer: 'unknown',
      errors,
    });
  }
}
