export function sanitizeFormData(value: FormDataEntryValue | null): string {
  if (value === null) return ''
  return String(value).trim()
}
