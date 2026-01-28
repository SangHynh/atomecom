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
  errorCode?: string;
  layer?: string;
  module?: string;
}

interface ErrorOptions {
  module?: string;
  layer?: string;
}

// ===== BASE ERROR =====
export class AppError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly layer: string;
  public readonly module: string;

  constructor({
    message,
    status,
    errorCode = 'APP_ERROR',
    layer = 'unknown',
    module = 'unknown',
  }: AppErrorArgs) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.layer = layer;
    this.module = module;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ===== CLIENT ERRORS =====
export class BadRequestError extends AppError {
  constructor(
    message: string = 'Bad request',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.BAD_REQUEST,
      errorCode: 'BAD_REQUEST',
      module,
      layer,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.UNAUTHORIZED,
      errorCode: 'UNAUTHORIZED',
      module,
      layer,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Forbidden',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.FORBIDDEN,
      errorCode: 'FORBIDDEN',
      module,
      layer,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.NOT_FOUND,
      errorCode: 'NOT_FOUND',
      module,
      layer,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = 'Conflict',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.CONFLICT,
      errorCode: 'CONFLICT',
      module,
      layer,
    });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    message: string = 'Unprocessable entity',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.UNPROCESSABLE_ENTITY,
      errorCode: 'UNPROCESSABLE_ENTITY',
      module,
      layer,
    });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Too many requests',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.TOO_MANY_REQUESTS,
      errorCode: 'TOO_MANY_REQUESTS',
      module,
      layer,
    });
  }
}

// ===== SERVER ERRORS =====

export class InternalServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      module,
      layer,
    });
  }
}

export class BadGatewayError extends AppError {
  constructor(
    message: string = 'Bad gateway',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.BAD_GATEWAY,
      errorCode: 'BAD_GATEWAY',
      module,
      layer,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service unavailable',
    { module = 'unknown', layer = 'unknown' }: ErrorOptions = {},
  ) {
    super({
      message,
      status: STATUS_CODE.SERVICE_UNAVAILABLE,
      errorCode: 'SERVICE_UNAVAILABLE',
      module,
      layer,
    });
  }
}
