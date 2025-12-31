'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit2, Loader2, MessageSquare, Send, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '@/lib/comment/actions'
import type { TCommentWithUser } from '@/lib/comment/types'

type TCardCommentsProps = {
  cardId: string
  currentUserId: string
  isBoardOwner: boolean
}

export function CardComments({
  cardId,
  currentUserId,
  isBoardOwner,
}: TCardCommentsProps) {
  const [comments, setComments] = useState<TCommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Load comments
  useEffect(() => {
    async function loadComments() {
      setIsLoading(true)
      const result = await getComments({ cardId })

      if (result.success && result.data) {
        setComments(result.data)
      } else if (result.error) {
        toast.error(result.error)
      }

      setIsLoading(false)
    }

    loadComments()
  }, [cardId])

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    setIsSubmitting(true)

    const result = await createComment({
      cardId,
      content: newComment.trim(),
    })

    if (result.success && result.data) {
      const newCommentData = result.data
      setComments((prev) => [newCommentData, ...prev])
      setNewComment('')
      toast.success('Comentario agregado')
    } else {
      toast.error(result.error ?? 'Error al crear el comentario')
    }

    setIsSubmitting(false)
  }

  // Handle edit comment
  const handleStartEdit = (comment: TCommentWithUser) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    setIsSubmitting(true)

    const result = await updateComment({
      id: commentId,
      content: editContent.trim(),
    })

    if (result.success && result.data) {
      const updatedCommentData = result.data
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedCommentData : c)),
      )
      setEditingCommentId(null)
      setEditContent('')
      toast.success('Comentario actualizado')
    } else {
      toast.error(result.error ?? 'Error al actualizar el comentario')
    }

    setIsSubmitting(false)
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return
    }

    const result = await deleteComment({ id: commentId })

    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Comentario eliminado')
    } else {
      toast.error(result.error ?? 'Error al eliminar el comentario')
    }
  }

  // Check if user can edit/delete comment
  const canModifyComment = (comment: TCommentWithUser) => {
    return comment.userId === currentUserId || isBoardOwner
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <MessageSquare className='w-5 h-5 text-muted-foreground' />
        <h3 className='font-semibold text-base'>
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* New comment form */}
      <div className='space-y-2'>
        <Textarea
          placeholder='Escribe un comentario... (puedes usar @usuario para mencionar)'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className='resize-none'
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmitComment()
            }
          }}
        />
        <div className='flex justify-between items-center'>
          <p className='text-xs text-muted-foreground'>
            Presiona Cmd/Ctrl + Enter para enviar
          </p>
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            size='sm'
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <Send className='w-4 h-4 mr-2' />
                Comentar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          <MessageSquare className='w-12 h-12 mx-auto mb-2 opacity-50' />
          <p>No hay comentarios todavía</p>
          <p className='text-sm'>Sé el primero en comentar</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className='flex gap-3 p-3 rounded-lg bg-muted/50'
            >
              <Avatar className='w-8 h-8'>
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback>
                  {comment.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 space-y-1'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm'>
                      {comment.user.name}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {format(
                        new Date(comment.createdAt),
                        "d 'de' MMMM, HH:mm",
                        {
                          locale: es,
                        },
                      )}
                      {comment.updatedAt !== comment.createdAt && ' (editado)'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  {canModifyComment(comment) && !editingCommentId && (
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleStartEdit(comment)}
                        className='h-7 px-2'
                      >
                        <Edit2 className='w-3 h-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteComment(comment.id)}
                        className='h-7 px-2 text-destructive hover:text-destructive'
                      >
                        <Trash2 className='w-3 h-3' />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Comment content or edit form */}
                {editingCommentId === comment.id ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isSubmitting}
                      rows={3}
                      className='resize-none text-sm'
                      autoFocus
                    />
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={isSubmitting || !editContent.trim()}
                        size='sm'
                      >
                        {isSubmitting ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          'Guardar'
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        size='sm'
                      >
                        <X className='w-4 h-4 mr-1' />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className='text-sm whitespace-pre-wrap'>
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
