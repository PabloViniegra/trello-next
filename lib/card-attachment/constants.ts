export const ATTACHMENT_CONFIG = {
  maxFileSize: 4.5 * 1024 * 1024, // 4.5 MB (límite Vercel)
  maxFilesPerCard: 10,

  allowedMimeTypes: [
    // Imágenes
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Texto
    'text/plain',
    'text/csv',
    'text/markdown',

    // Archivos comprimidos
    'application/zip',
    'application/x-rar-compressed',
  ],

  // Extensiones para validación adicional
  allowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.md',
    '.zip',
    '.rar',
  ],
} as const

export const ATTACHMENT_ERRORS = {
  FILE_TOO_LARGE: 'Archivo demasiado grande (máx 4.5MB)',
  INVALID_FILE_TYPE: 'Formato no soportado',
  MAX_FILES_REACHED: 'Límite de archivos alcanzado',
  UPLOAD_FAILED: 'Error al subir',
  DELETE_FAILED: 'Error al eliminar',
  NOT_FOUND: 'Adjunto no encontrado',
  UNAUTHORIZED: 'Sin permiso',
} as const
