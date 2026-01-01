'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Download,
  ExternalLink,
  FileIcon,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dropzone } from '@/components/kibo-ui/dropzone'
import { Button } from '@/components/ui/button'

import {
  deleteAttachment,
  uploadAttachment,
} from '@/lib/card-attachment/actions'
import {
  ATTACHMENT_CONFIG,
  ATTACHMENT_ERRORS,
} from '@/lib/card-attachment/constants'
import type { TCardAttachmentWithUploader } from '@/lib/card-attachment/types'
import { formatFileSize } from '@/lib/utils'

interface CardAttachmentsProps {
  cardId: string
  attachments?: TCardAttachmentWithUploader[]
  canEdit: boolean
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return FileImage
  if (contentType.includes('pdf') || contentType.includes('document'))
    return FileText
  return FileIcon
}

function isPreviewable(contentType: string) {
  return contentType.startsWith('image/')
}

export function CardAttachments({
  cardId,
  attachments = [],
  canEdit,
}: CardAttachmentsProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [optimisticAttachments, setOptimisticAttachments] =
    useState<TCardAttachmentWithUploader[]>(attachments)
  const [isUploading, startUploadTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  // Sincronizar estado local con props del servidor
  useEffect(() => {
    setOptimisticAttachments(attachments)
  }, [attachments])

  const handleUpload = () => {
    if (files.length === 0) return

    startUploadTransition(async () => {
      const file = files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('cardId', cardId)
      formData.append('file', file)

      const result = await uploadAttachment(formData)

      if (result.success && result.data) {
        toast.success('Archivo subido correctamente')

        // Actualización optimista
        const newAttachment: TCardAttachmentWithUploader = {
          ...result.data,
          uploader: {
            id: result.data.uploadedBy,
            name: 'Tú', // Nombre temporal hasta que refresque
            image: null,
          },
        }

        setOptimisticAttachments((prev) => [newAttachment, ...prev])
        setFiles([])
        router.refresh()
      } else {
        toast.error(result.error ?? ATTACHMENT_ERRORS.UPLOAD_FAILED)
      }
    })
  }

  const handleDelete = (attachmentId: string) => {
    startDeleteTransition(async () => {
      const result = await deleteAttachment({ attachmentId })

      if (result.success) {
        toast.success('Archivo eliminado correctamente')
        // Actualización optimista: eliminar inmediato de la lista
        setOptimisticAttachments((prev) =>
          prev.filter((a) => a.id !== attachmentId),
        )
        router.refresh()
      } else {
        toast.error(result.error ?? ATTACHMENT_ERRORS.DELETE_FAILED)
      }
    })
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Paperclip className='h-4 w-4 text-muted-foreground' />
          <h3 className='font-medium text-sm'>
            Adjuntos ({optimisticAttachments.length})
          </h3>
        </div>
      </div>

      {canEdit && (
        <div className='space-y-2'>
          <Dropzone
            src={files}
            maxFiles={1}
            maxSize={ATTACHMENT_CONFIG.maxFileSize}
            accept={Object.fromEntries(
              ATTACHMENT_CONFIG.allowedMimeTypes.map((type) => [type, []]),
            )}
            onDrop={(acceptedFiles) => setFiles(acceptedFiles)}
            onError={(error) => {
              if (error.message.includes('File type must be one of')) {
                toast.error(ATTACHMENT_ERRORS.INVALID_FILE_TYPE)
              } else if (error.message.includes('File is larger than')) {
                toast.error(ATTACHMENT_ERRORS.FILE_TOO_LARGE)
              } else {
                toast.error(error.message)
              }
            }}
            disabled={isUploading}
            className='border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors'
          >
            {files.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-3 py-6'>
                <Upload className='h-10 w-10 text-muted-foreground' />
                <div className='text-center space-y-1'>
                  <p className='text-sm font-medium'>
                    Arrastra y suelta un archivo aquí
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    o haz clic para seleccionar
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Máximo {formatFileSize(ATTACHMENT_CONFIG.maxFileSize)}
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-4 py-4'>
                <FileIcon className='h-8 w-8 text-muted-foreground' />
                <div className='text-center space-y-1'>
                  <p className='text-sm font-medium truncate max-w-[200px]'>
                    {files[0]?.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(files[0]?.size || 0)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Haz clic para cambiar
                  </p>
                </div>
              </div>
            )}
          </Dropzone>

          {files.length > 0 && (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                className='flex-1'
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Subiendo...
                  </>
                ) : (
                  'Subir'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {optimisticAttachments.length > 0 ? (
        <div className='space-y-2'>
          {optimisticAttachments.map((attachment) => {
            const Icon = getFileIcon(attachment.contentType)
            const canPreview = isPreviewable(attachment.contentType)

            return (
              <div
                key={attachment.id}
                className='flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors group'
              >
                {canPreview ? (
                  <div className='h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0'>
                    {/* biome-ignore lint/performance/noImgElement: Simpler for blob storage images without domain config */}
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className='h-full w-full object-cover'
                    />
                  </div>
                ) : (
                  <div className='h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0'>
                    <Icon className='h-6 w-6 text-muted-foreground' />
                  </div>
                )}

                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {attachment.fileName}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(attachment.fileSize)} • Subido por{' '}
                    <span className='font-medium'>
                      {attachment.uploader?.name || 'Usuario desconocido'}
                    </span>{' '}
                    {formatDistanceToNow(new Date(attachment.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>

                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Button variant='ghost' size='icon' asChild>
                    <a
                      href={attachment.fileUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </Button>

                  <Button variant='ghost' size='icon' asChild>
                    <a href={attachment.downloadUrl} download>
                      <Download className='h-4 w-4' />
                    </a>
                  </Button>

                  {canEdit && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(attachment.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className='text-sm text-muted-foreground py-2'>
          No hay archivos adjuntos
        </p>
      )}
    </div>
  )
}
