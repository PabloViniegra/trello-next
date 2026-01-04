// =============================================================================
// AVATAR UPLOAD CONSTRAINTS
// =============================================================================

export const AVATAR_UPLOAD_CONSTRAINTS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const,
  ALLOWED_TYPES_DISPLAY: 'JPEG, PNG, GIF, WebP',
} as const

// =============================================================================
// USER MESSAGES
// =============================================================================

export const USER_MESSAGES = {
  NAME_UPDATED: 'Nombre actualizado correctamente',
  PASSWORD_UPDATED: 'Contraseña actualizada correctamente',
  AVATAR_UPDATED: 'Avatar actualizado correctamente',
  AVATAR_DELETED: 'Avatar eliminado correctamente',
} as const

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const USER_ERRORS = {
  UNAUTHORIZED: 'Debes iniciar sesión para actualizar tu perfil',
  UNAUTHORIZED_PASSWORD: 'Debes iniciar sesión para actualizar tu contraseña',
  UNAUTHORIZED_AVATAR: 'Debes iniciar sesión para actualizar tu avatar',
  UNAUTHORIZED_DELETE_AVATAR: 'Debes iniciar sesión para eliminar tu avatar',
  NO_AVATAR: 'No tienes un avatar para eliminar',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta',
  UPDATE_NAME_FAILED: 'Error al actualizar el nombre. Por favor, intenta de nuevo.',
  UPDATE_PASSWORD_FAILED: 'Error al actualizar la contraseña. Por favor, intenta de nuevo.',
  UPLOAD_AVATAR_FAILED: 'Error al subir la imagen. Por favor, intenta de nuevo.',
  DELETE_AVATAR_FAILED: 'Error al eliminar el avatar. Por favor, intenta de nuevo.',
} as const
