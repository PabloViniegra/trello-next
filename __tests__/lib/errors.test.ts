import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppError, getErrorMessage, logError } from '@/lib/errors'

describe('Errors', () => {
  describe('AppError', () => {
    it('creates an error with code and message', () => {
      const error = new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid login')
      expect(error.code).toBe('AUTH_INVALID_CREDENTIALS')
      expect(error.message).toBe('Invalid login')
      expect(error.name).toBe('AppError')
    })

    it('stores original error', () => {
      const originalError = new Error('Original')
      const error = new AppError('INTERNAL_ERROR', 'Wrapped', originalError)
      expect(error.originalError).toBe(originalError)
    })

    it('extends Error', () => {
      const error = new AppError('NOT_FOUND', 'Not found')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
    })

    it('has correct error codes', () => {
      const codes = [
        'AUTH_INVALID_CREDENTIALS',
        'AUTH_DUPLICATE_EMAIL',
        'AUTH_UNKNOWN_ERROR',
        'DB_CONNECTION_ERROR',
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'INTERNAL_ERROR',
      ] as const

      for (const code of codes) {
        const error = new AppError(code, 'Test message')
        expect(error.code).toBe(code)
      }
    })
  })

  describe('logError', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')

      logError(error, 'testFunction')

      expect(consoleSpy).toHaveBeenCalledWith('[testFunction]', error)
    })

    it('logs non-Error objects', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      logError('string error', 'context')

      expect(consoleSpy).toHaveBeenCalledWith('[context]', 'string error')
    })

    it('logs AppError', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new AppError('UNAUTHORIZED', 'Access denied')

      logError(error, 'authCheck')

      expect(consoleSpy).toHaveBeenCalledWith('[authCheck]', error)
    })
  })

  describe('getErrorMessage', () => {
    it('returns message from AppError', () => {
      const error = new AppError('FORBIDDEN', 'You cannot do this')
      expect(getErrorMessage(error)).toBe('You cannot do this')
    })

    it('returns message from standard Error', () => {
      const error = new Error('Standard error message')
      expect(getErrorMessage(error)).toBe('Standard error message')
    })

    it('returns default message for non-Error objects', () => {
      expect(getErrorMessage('string')).toBe('Ha ocurrido un error inesperado')
      expect(getErrorMessage(null)).toBe('Ha ocurrido un error inesperado')
      expect(getErrorMessage(undefined)).toBe('Ha ocurrido un error inesperado')
      expect(getErrorMessage(123)).toBe('Ha ocurrido un error inesperado')
      expect(getErrorMessage({})).toBe('Ha ocurrido un error inesperado')
    })
  })
})
