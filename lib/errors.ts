export type TErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_DUPLICATE_EMAIL'
  | 'AUTH_UNKNOWN_ERROR'
  | 'DB_CONNECTION_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  constructor(
    public code: TErrorCode,
    message: string,
    public originalError?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function logError(error: unknown, context: string): void {
  // En producción, enviar a servicio de tracking de errores (Sentry, etc.)
  console.error(`[${context}]`, error)

  // TODO: Agregar integración con servicio de tracking de errores
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error)
  // }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ha ocurrido un error inesperado'
}
