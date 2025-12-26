'use client'

import { Check, Loader2, UserPlus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getBoardMembers } from '@/lib/board-member/actions'
import {
  assignCardMember,
  getCardMembersAction,
  unassignCardMember,
} from '@/lib/card-member/actions'
import type { TCardMember } from '@/lib/card-member/types'
import { cn } from '@/lib/utils'

type TCardMembersSelectorProps = {
  cardId: string
  boardId: string
}

type TBoardMember = {
  id: string
  name: string
  email: string
  image?: string | null
}

export function CardMembersSelector({
  cardId,
  boardId,
}: TCardMembersSelectorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [boardMembers, setBoardMembers] = useState<TBoardMember[]>([])
  const [cardMembers, setCardMembers] = useState<TCardMember[]>([])
  const [submitting, setSubmitting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load board members
      const boardMembersResult = await getBoardMembers(boardId)
      if (boardMembersResult.success && boardMembersResult.data) {
        setBoardMembers(boardMembersResult.data)
      } else {
        toast.error(
          boardMembersResult.error || 'Error al cargar miembros del tablero',
        )
      }

      // Load card members
      const cardMembersResult = await getCardMembersAction(cardId)
      if (cardMembersResult.success && cardMembersResult.data) {
        setCardMembers(cardMembersResult.data)
      } else {
        toast.error(
          cardMembersResult.error || 'Error al cargar miembros de la tarjeta',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [cardId, boardId])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  const handleToggleMember = async (userId: string) => {
    // Prevent race conditions from multiple clicks
    if (submitting) return

    const isAssigned = cardMembers.some((m) => m.userId === userId)

    setSubmitting(userId)
    try {
      if (isAssigned) {
        // Unassign
        const result = await unassignCardMember({ cardId, userId })
        if (result.success) {
          setCardMembers((prev) => prev.filter((m) => m.userId !== userId))
          toast.success('Miembro desasignado correctamente')
        } else {
          toast.error(result.error || 'Error al desasignar miembro')
        }
      } else {
        // Assign
        const result = await assignCardMember({ cardId, userId })
        if (result.success && result.data) {
          const newMember = result.data
          setCardMembers((prev) => [...prev, newMember])
          toast.success('Miembro asignado correctamente')
        } else {
          toast.error(result.error || 'Error al asignar miembro')
        }
      }
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <UserPlus className='w-4 h-4' />
          Miembros
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold text-sm'>Miembros de la tarjeta</h3>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => setOpen(false)}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {loading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ScrollArea className='max-h-[320px]'>
            <div className='p-2 space-y-1'>
              {boardMembers.map((member) => {
                const isAssigned = cardMembers.some(
                  (m) => m.userId === member.id,
                )
                const isLoading = submitting === member.id

                const initials = member.name
                  ? member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : member.email.slice(0, 2).toUpperCase()

                return (
                  <button
                    key={member.id}
                    type='button'
                    onClick={() => handleToggleMember(member.id)}
                    disabled={isLoading}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-md transition-colors',
                      'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
                      isAssigned && 'bg-accent/50',
                    )}
                  >
                    <Avatar className='w-8 h-8'>
                      <AvatarImage
                        src={member.image || undefined}
                        alt={member.name || member.email}
                      />
                      <AvatarFallback className='text-xs font-medium'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 text-left min-w-0'>
                      <p className='text-sm font-medium truncate'>
                        {member.name || 'Sin nombre'}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {member.email}
                      </p>
                    </div>

                    {isLoading ? (
                      <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                    ) : isAssigned ? (
                      <Check className='w-4 h-4 text-primary' />
                    ) : null}
                  </button>
                )
              })}

              {boardMembers.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  No hay miembros en este tablero
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
