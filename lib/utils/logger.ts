/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with levels, contexts, and environment-based filtering.
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export type LogContext = Record<string, unknown>

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: string
  stack?: string
}

class LoggerClass {
  private isDevelopment: boolean
  private minLevel: LogLevel

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development"
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ""
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const { timestamp, level, message, context, error, stack } = entry
    const formatted = this.formatMessage(level, message, context)

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
      case LogLevel.INFO:
        console.log(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        if (error) console.warn(`  Error: ${error}`)
        if (stack) console.warn(`  Stack: ${stack}`)
        break
      case LogLevel.ERROR:
        console.error(formatted)
        if (error) console.error(`  Error: ${error}`)
        if (stack) console.error(`  Stack: ${stack}`)
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log({ timestamp: new Date().toISOString(), level: LogLevel.DEBUG, message, context })
  }

  info(message: string, context?: LogContext): void {
    this.log({ timestamp: new Date().toISOString(), level: LogLevel.INFO, message, context })
  }

  warn(message: string, context?: LogContext): void {
    this.log({ timestamp: new Date().toISOString(), level: LogLevel.WARN, message, context })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error: error?.message,
      stack: error?.stack,
    })
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): LoggerChild {
    return new LoggerChild(this, context)
  }
}

/**
 * Child logger that automatically includes context
 */
class LoggerChild {
  private parent: LoggerClass
  private context: LogContext

  constructor(parent: LoggerClass, context: LogContext) {
    this.parent = parent
    this.context = context
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.context, ...context })
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.context, ...context })
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.context, ...context })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, { ...this.context, ...context })
  }

  child(additionalContext: LogContext): LoggerChild {
    return new LoggerChild(this.parent, { ...this.context, ...additionalContext })
  }
}

// Export singleton logger instance
export const logger = new LoggerClass()

// Export for module-level logging
export const createLogger = (module: string): LoggerChild => {
  return logger.child({ module })
}
