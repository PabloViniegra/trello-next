'use client'

import { AlignLeft, Clock, MessageSquare, Paperclip } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { TCard, TCardWithDetails, TCardWithLabels } from '@/lib/card/types'
import { cn } from '@/lib/utils'
import { editorStateToPlainText, isValidEditorState } from '@/lib/utils/editor'
import { useBoardStore } from '@/store/board-store'
import { CardMembersAvatars } from './card-members-avatars'
import { DeleteCardDialog } from './delete-card-dialog'
import { LabelBadge } from './label-badge'

type TCardItemProps = {
  card: TCard | TCardWithLabels | TCardWithDetails
}

type TDueDateStatus = {
  status: 'overdue' | 'today' | 'soon' | 'upcoming'
  label: string
  color: string
} | null

function getDueDateStatus(dueDate: Date | null, now: Date): TDueDateStatus {
  if (!dueDate) return null

  const due = new Date(dueDate)
  const diffInDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffInDays < 0) {
    return { status: 'overdue', label: 'Vencida', color: 'bg-red-500' }
  }
  if (diffInDays === 0) {
    return { status: 'today', label: 'Hoy', color: 'bg-orange-500' }
  }
  if (diffInDays <= 2) {
    return { status: 'soon', label: 'Pronto', color: 'bg-yellow-500' }
  }
  return { status: 'upcoming', label: 'Próxima', color: 'bg-green-500' }
}

export function CardItem({ card }: TCardItemProps) {
  const { setActiveCard, openCardModal } = useBoardStore()

  // Use useState to track client-side date for hydration safety
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Set current date only on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date())
    setIsClient(true)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent drag from starting
      setActiveCard(card.id)
      openCardModal()
    },
    [card.id, setActiveCard, openCardModal],
  )

  // Calculate status only when we have the client date
  const dueDateStatus = currentDate
    ? getDueDateStatus(card.dueDate, currentDate)
    : null
  const hasDescription = Boolean(card.description)

  // Convert editor state to plain text for preview
  const descriptionPreview = card.description
    ? (() => {
        try {
          const parsed = JSON.parse(card.description)
          if (isValidEditorState(parsed)) {
            return editorStateToPlainText(parsed)
          }
          return card.description
        } catch {
          return card.description
        }
      })()
    : ''

  // Type-safe checks with proper existence validation
  const hasLabels = 'labels' in card && card.labels && card.labels.length > 0
  const visibleLabels = hasLabels ? card.labels.slice(0, 3) : []
  const remainingLabels = hasLabels ? card.labels.length - 3 : 0

  const hasMembers =
    'members' in card && card.members && card.members.length > 0

  const hasAttachments =
    'attachments' in card && card.attachments && card.attachments.length > 0
  const attachmentCount =
    'attachments' in card ? (card.attachments?.length ?? 0) : 0

  const hasComments =
    'comments' in card && card.comments && card.comments.length > 0
  const commentCount = 'comments' in card ? (card.comments?.length ?? 0) : 0

  return (
    <div className='relative group'>
      {/* Delete Button - Only visible on hover */}
      <DeleteCardDialog cardId={card.id} cardTitle={card.title} />

      <button
        type='button'
        className='w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg'
        onClick={handleClick}
        aria-label={`Abrir detalles de la tarjeta: ${card.title}`}
      >
        <Card className='shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-200 border-l-4 border-l-primary/20 group-hover:border-l-primary'>
          <CardContent className='p-4 space-y-3'>
            {/* Labels */}
            {hasLabels && (
              <div className='flex flex-wrap gap-1.5'>
                {visibleLabels.map((label) => (
                  <LabelBadge key={label.id} label={label} size='sm' />
                ))}
                {remainingLabels > 0 && (
                  <span className='inline-flex items-center h-5 px-2 text-xs font-mono font-medium text-muted-foreground bg-muted rounded-md'>
                    +{remainingLabels}
                  </span>
                )}
              </div>
            )}

            {/* Card Title */}
            <h3 className='text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors'>
              {card.title}
            </h3>

            {/* Card Metadata Section - Always visible with conditional content */}
            {(isClient && card.dueDate) ||
            hasDescription ||
            hasMembers ||
            hasAttachments ||
            hasComments ? (
              <div className='flex flex-wrap gap-2 items-center'>
                {/* Due Date Badge - Only render on client to avoid hydration mismatch */}
                {isClient && dueDateStatus && card.dueDate && (
                  <Badge
                    variant='secondary'
                    className={cn(
                      'text-xs px-2 py-1 font-mono font-medium flex items-center gap-1.5 transition-colors',
                      dueDateStatus.status === 'overdue' &&
                        'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
                      dueDateStatus.status === 'today' &&
                        'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:hover:bg-orange-900',
                      dueDateStatus.status === 'soon' &&
                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900',
                      dueDateStatus.status === 'upcoming' &&
                        'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900',
                    )}
                  >
                    <Clock className='w-3.5 h-3.5' />
                    {new Date(card.dueDate).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Badge>
                )}

                {/* Description Indicator */}
                {hasDescription && (
                  <Badge
                    variant='secondary'
                    className='text-xs px-2 py-1 font-normal flex items-center gap-1.5 bg-muted hover:bg-muted/80'
                  >
                    <AlignLeft className='w-3.5 h-3.5' />
                    <span className='text-muted-foreground'>Descripción</span>
                  </Badge>
                )}

                {/* Attachments Indicator */}
                {hasAttachments && (
                  <Badge
                    variant='secondary'
                    className='text-xs px-2 py-1 font-normal flex items-center gap-1.5 bg-muted hover:bg-muted/80'
                  >
                    <Paperclip className='w-3.5 h-3.5' />
                    <span className='text-muted-foreground'>
                      {attachmentCount}
                    </span>
                  </Badge>
                )}

                {/* Comments Indicator */}
                {hasComments && (
                  <Badge
                    variant='secondary'
                    className='text-xs px-2 py-1 font-normal flex items-center gap-1.5 bg-muted hover:bg-muted/80'
                  >
                    <MessageSquare className='w-3.5 h-3.5' />
                    <span className='text-muted-foreground'>
                      {commentCount}
                    </span>
                  </Badge>
                )}

                {/* Members Avatars */}
                {hasMembers && 'members' in card && (
                  <CardMembersAvatars
                    members={card.members}
                    size='sm'
                    maxVisible={3}
                  />
                )}
              </div>
            ) : null}

            {/* Card Description Preview (optional) */}
            {hasDescription && descriptionPreview && (
              <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1 border-t border-border/50'>
                {descriptionPreview}
              </p>
            )}
          </CardContent>
        </Card>
      </button>
    </div>
  )
}
