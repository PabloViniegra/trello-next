import type { FieldErrors, FieldValues } from 'react-hook-form'

/**
 * Sanitizes form data from FormData entries
 */
export function sanitizeFormData(value: FormDataEntryValue | null): string {
  if (value === null) return ''
  return String(value).trim()
}

/**
 * Gets the error message for a specific field from React Hook Form errors
 * Returns undefined if no error exists for the field
 */
export function getFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  field: keyof T,
): string | undefined {
  const error = errors[field as string]
  return error?.message as string | undefined
}

/**
 * Checks if a form field has an error
 */
export function hasFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  field: keyof T,
): boolean {
  return !!errors[field as string]
}
