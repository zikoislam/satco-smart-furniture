/**
 * Typed domain and HTTP error classes aligned with RFC 7807 and Api-spac.md.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown, code = 'VALIDATION_ERROR') {
    super(message, 400, code, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED', details?: unknown) {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'FORBIDDEN', details?: unknown) {
    super(message, 403, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', details?: unknown) {
    super(message, 404, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT', details?: unknown) {
    super(message, 409, code, details);
  }
}

export class DomainRuleError extends AppError {
  constructor(code: string, message: string, details?: unknown, statusCode = 422) {
    super(message, statusCode, code, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED', details?: unknown) {
    super(message, 429, code, details);
  }
}
