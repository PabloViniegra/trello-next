'use server'

import { del, put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { user } from '@/auth-schema'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import {
  deleteAvatarSchema,
  updateUserNameSchema,
  updateUserPasswordSchema,
  uploadAvatarSchema,
} from './schemas'
import type { TAvatarUploadResult, TProfileUpdateResult } from './types'

// =============================================================================
// UPDATE USER NAME
// =============================================================================

/**
 * Updates the user's name
 *
 * @param data - Object containing the new name
 * @returns Result object indicating success or failure
 */
export async function updateUserName(data: {
  name: string
}): Promise<TProfileUpdateResult> {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: 'Debes iniciar sesión para actualizar tu perfil',
      }
    }

    // 2. Validation
    const validation = updateUserNameSchema.safeParse(data)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? 'Nombre inválido',
      }
    }

    // 3. Update in database
    await db
      .update(user)
      .set({
        name: validation.data.name,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))

    // 4. Revalidate cache
    revalidatePath('/profile')

    return { success: true }
  } catch (error) {
    logError(error, 'updateUserName')
    return {
      success: false,
      error: 'Error al actualizar el nombre. Por favor, intenta de nuevo.',
    }
  }
}

// =============================================================================
// UPDATE USER PASSWORD
// =============================================================================

/**
 * Updates the user's password after verifying current password
 *
 * @param data - Object containing current password, new password, and confirmation
 * @returns Result object indicating success or failure
 */
export async function updateUserPassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<TProfileUpdateResult> {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: 'Debes iniciar sesión para actualizar tu contraseña',
      }
    }

    // 2. Validation
    const validation = updateUserPasswordSchema.safeParse(data)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? 'Datos de contraseña inválidos',
      }
    }

    // 3. Verify current password using better-auth
    const headersList = await nextHeaders()
    try {
      await auth.api.signInEmail({
        body: {
          email: currentUser.email,
          password: validation.data.currentPassword,
        },
        headers: headersList,
      })
    } catch (error) {
      logError(error, 'updateUserPassword.verifyCurrentPassword')

      // Analyze error type to provide specific feedback
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        const message = error.message.toLowerCase()

        if (message.includes('invalid') || message.includes('incorrect')) {
          return {
            success: false,
            error: 'La contraseña actual es incorrecta',
          }
        }
      }

      // Network error or other problem
      return {
        success: false,
        error: 'Error al verificar la contraseña. Por favor, intenta de nuevo.',
      }
    }

    // 4. Update password using better-auth
    try {
      await auth.api.changePassword({
        body: {
          newPassword: validation.data.newPassword,
          currentPassword: validation.data.currentPassword,
        },
        headers: headersList,
      })
    } catch (error) {
      logError(error, 'updateUserPassword.changePassword')
      return {
        success: false,
        error: 'Error al actualizar la contraseña. Por favor, intenta de nuevo.',
      }
    }

    return { success: true }
  } catch (error) {
    logError(error, 'updateUserPassword')
    return {
      success: false,
      error: 'Error al actualizar la contraseña. Por favor, intenta de nuevo.',
    }
  }
}

// =============================================================================
// UPLOAD AVATAR
// =============================================================================

/**
 * Uploads a new avatar image for the user
 *
 * @param formData - FormData containing the image file
 * @returns Result object with the new avatar URL or error
 */
export async function uploadAvatar(
  formData: FormData,
): Promise<TAvatarUploadResult> {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: 'Debes iniciar sesión para actualizar tu avatar',
      }
    }

    // 2. Extract and validate file
    const file = formData.get('file') as File
    const validation = uploadAvatarSchema.safeParse({ file })

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return {
        success: false,
        error: firstError?.message ?? 'Archivo inválido',
      }
    }

    // 3. Delete old avatar if exists
    if (currentUser.image) {
      try {
        await del(currentUser.image)
      } catch (deleteError) {
        // Log but don't fail - old avatar might not exist in blob storage
        logError(deleteError, 'uploadAvatar.deleteOldAvatar')
      }
    }

    // 4. Upload to Vercel Blob
    const fileKey = `${currentUser.id}-${crypto.randomUUID()}`
    const fileExtension = file.name.split('.').pop()
    const fileName = fileExtension ? `${fileKey}.${fileExtension}` : fileKey

    let blob: { url: string; downloadUrl: string }
    try {
      blob = await put(`avatars/${fileName}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })
    } catch (blobError) {
      logError(blobError, 'uploadAvatar.blob')
      return {
        success: false,
        error: 'Error al subir la imagen. Por favor, intenta de nuevo.',
      }
    }

    // 5. Update user record in database
    try {
      await db
        .update(user)
        .set({
          image: blob.url,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentUser.id))
    } catch (dbError) {
      // Rollback: delete uploaded blob if database update fails
      try {
        await del(blob.url)
      } catch {
        // Ignore cleanup errors
      }
      logError(dbError, 'uploadAvatar.db')
      return {
        success: false,
        error: 'Error al guardar la imagen. Por favor, intenta de nuevo.',
      }
    }

    // 6. Revalidate cache
    revalidatePath('/profile')

    return {
      success: true,
      data: {
        imageUrl: blob.url,
      },
    }
  } catch (error) {
    logError(error, 'uploadAvatar')
    return {
      success: false,
      error: 'Error al subir la imagen. Por favor, intenta de nuevo.',
    }
  }
}

// =============================================================================
// DELETE AVATAR
// =============================================================================

/**
 * Deletes the user's avatar and reverts to showing initials
 *
 * @returns Result object indicating success or failure
 */
export async function deleteAvatar(): Promise<TProfileUpdateResult> {
  try {
    // 1. Authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: 'Debes iniciar sesión para eliminar tu avatar',
      }
    }

    // 2. Check if user has an avatar
    if (!currentUser.image) {
      return {
        success: false,
        error: 'No tienes un avatar para eliminar',
      }
    }

    // 3. Delete from Vercel Blob (tolerant to errors)
    try {
      await del(currentUser.image)
    } catch (blobError) {
      // Log but don't fail - the database record will still be updated
      logError(blobError, 'deleteAvatar.blobDelete')
    }

    // 4. Update user record in database
    await db
      .update(user)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))

    // 5. Revalidate cache
    revalidatePath('/profile')

    return { success: true }
  } catch (error) {
    logError(error, 'deleteAvatar')
    return {
      success: false,
      error: 'Error al eliminar el avatar. Por favor, intenta de nuevo.',
    }
  }
}
