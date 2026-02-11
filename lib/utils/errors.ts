/**
 * Custom Error Classes for Application Errors
 * 
 * Provides typed error classes for different error scenarios.
 */

export enum ErrorCode {
  // Authentication errors (AUTH_*)
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN = "AUTH_FORBIDDEN",
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID",

  // Validation errors (VALID_*)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  VALIDATION_REQUIRED = "VALIDATION_REQUIRED",
  VALIDATION_INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  VALIDATION_NOT_FOUND = "VALIDATION_NOT_FOUND",

  // Database errors (DB_*)
  DB_ERROR = "DB_ERROR",
  DB_CONSTRAINT = "DB_CONSTRAINT",
  DB_NOT_FOUND = "DB_NOT_FOUND",
  DB_CONFLICT = "DB_CONFLICT",

  // Business logic errors (BUS_*)
  BUSINESS_ERROR = "BUSINESS_ERROR",
  BUSINESS_INVALID_STATE = "BUSINESS_INVALID_STATE",
  BUSINESS_ALREADY_EXISTS = "BUSINESS_ALREADY_EXISTS",
  BUSINESS_NOT_ALLOWED = "BUSINESS_NOT_ALLOWED",

  // Server errors (SRV_*)
  SERVER_ERROR = "SERVER_ERROR",
  SERVER_TIMEOUT = "SERVER_TIMEOUT",
  SERVER_UNAVAILABLE = "SERVER_UNAVAILABLE",
}

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly context?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SERVER_ERROR,
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.context = context
    this.isOperational = isOperational

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      isOperational: this.isOperational,
    }
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication required",
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.AUTH_UNAUTHORIZED, context)
    this.name = "AuthenticationError"
  }
}

/**
 * Authorization error (forbidden)
 */
export class AuthorizationError extends AppError {
  constructor(
    message = "Access denied",
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.AUTH_FORBIDDEN, context)
    this.name = "AuthorizationError"
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public readonly field?: string
  public readonly value?: unknown

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, context)
    this.name = "ValidationError"
    this.field = field
    this.value = value
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    }
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id?: string,
    context?: Record<string, unknown>
  ) {
    super(`${resource} not found${id ? `: ${id}` : ""}`, ErrorCode.DB_NOT_FOUND, {
      resource,
      id,
      ...context,
    })
    this.name = "NotFoundError"
  }
}

/**
 * Conflict error (e.g., duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.DB_CONFLICT, context)
    this.name = "ConflictError"
  }
}

/**
 * Business logic error
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.BUSINESS_ERROR, context)
    this.name = "BusinessError"
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, ErrorCode.DB_ERROR, context)
    this.name = "DatabaseError"
  }
}

/**
 * Error boundary fallback props
 */
export interface ErrorFallbackProps {
  error: Error & { digest?: string }
  resetErrorBoundary: () => void
}

/**
 * Format error for client display
 */
export function formatErrorForClient(error: Error): Record<string, unknown> {
  if (error instanceof AppError) {
    return error.toJSON()
  }

  return {
    name: error.name,
    message: error.message,
    code: ErrorCode.SERVER_ERROR,
    isOperational: false,
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}
