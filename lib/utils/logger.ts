/**
 * Structured Logging Utility
 * Provides consistent logging across the application with proper levels
 */

type TLogLevel = 'debug' | 'info' | 'warn' | 'error'

type TLogContext = Record<string, unknown>

/**
 * Structured logger that only logs in development or when explicitly enabled
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isEnabled = process.env.ENABLE_LOGGING === 'true'

  private shouldLog(level: TLogLevel): boolean {
    // Always log errors
    if (level === 'error') return true
    // Log other levels only in development or when explicitly enabled
    return this.isDevelopment || this.isEnabled
  }

  private formatMessage(
    level: TLogLevel,
    message: string,
    context?: TLogContext,
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: TLogContext): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: TLogContext): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message, context))
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: TLogContext): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message, context))
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: unknown, context?: TLogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    }
    console.error(this.formatMessage('error', message, errorContext))
  }
}

export const logger = new Logger()
