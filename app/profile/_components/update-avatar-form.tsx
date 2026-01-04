'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { deleteAvatar, uploadAvatar } from '@/lib/user/actions'
import {
  AVATAR_UPLOAD_CONSTRAINTS,
  USER_MESSAGES,
} from '@/lib/user/constants'

type TUpdateAvatarFormProps = {
  currentImageUrl?: string
  userName: string
  onSuccess?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UpdateAvatarForm({
  currentImageUrl,
  userName,
  onSuccess,
}: TUpdateAvatarFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentImageUrl,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size on client
    if (file.size > AVATAR_UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES) {
      toast.error(
        `El archivo no puede superar ${AVATAR_UPLOAD_CONSTRAINTS.MAX_SIZE_MB}MB`,
      )
      return
    }

    // Validate file type on client
    if (
      !AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(
        file.type as (typeof AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES)[number],
      )
    ) {
      toast.error(
        `Solo se permiten imágenes (${AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES_DISPLAY})`,
      )
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      if (result.success && result.data) {
        toast.success(USER_MESSAGES.AVATAR_UPDATED)
        setPreviewUrl(result.data.imageUrl)
        onSuccess?.()
      } else if (!result.success) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error al subir la imagen')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleDelete() {
    if (!previewUrl) return

    setIsDeleting(true)

    try {
      const result = await deleteAvatar()

      if (result.success) {
        toast.success(USER_MESSAGES.AVATAR_DELETED)
        setPreviewUrl(undefined)
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error al eliminar el avatar')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  const isLoading = isUploading || isDeleting

  return (
    <div className='flex items-center gap-6'>
      <Avatar className='h-24 w-24'>
        <AvatarImage src={previewUrl} alt={userName} />
        <AvatarFallback className='text-2xl'>
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col gap-2'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/gif,image/webp'
          onChange={handleFileChange}
          className='hidden'
          disabled={isLoading}
        />

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleUploadClick}
          disabled={isLoading}
        >
          {isUploading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Subiendo...
            </>
          ) : (
            <>
              <Camera className='mr-2 h-4 w-4' />
              {previewUrl ? 'Cambiar avatar' : 'Subir avatar'}
            </>
          )}
        </Button>

        {previewUrl && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isDeleting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className='mr-2 h-4 w-4' />
                Eliminar avatar
              </>
            )}
          </Button>
        )}

        <p className='text-xs text-muted-foreground'>
          Formatos: {AVATAR_UPLOAD_CONSTRAINTS.ALLOWED_TYPES_DISPLAY}. Máximo{' '}
          {AVATAR_UPLOAD_CONSTRAINTS.MAX_SIZE_MB}MB
        </p>
      </div>
    </div>
  )
}
