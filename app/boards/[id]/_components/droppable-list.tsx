'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Check, X } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { TBoard } from '@/lib/board/types'
import { updateList } from '@/lib/list/actions'
import type { TListWithCards } from '@/lib/list/types'
import { cn } from '@/lib/utils'
import { DraggableCard } from './draggable-card'
import { ListActionsMenu } from './list-actions-menu'

type TDroppableListProps = {
  list: TListWithCards
  board: TBoard
}

/**
 * A droppable list container that accepts draggable cards.
 * Displays list title, cards, and actions menu.
 *
 * @param list - The list data with its cards
 * @param board - The parent board (used for styling)
 */
export function DroppableList({ list, board }: TDroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(list.title)
  const [isPending, startTransition] = useTransition()

  const cardIds = useMemo(() => list.cards.map((card) => card.id), [list.cards])

  const handleRename = () => {
    setIsRenaming(true)
    setNewTitle(list.title)
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    setNewTitle(list.title)
  }

  const handleConfirmRename = () => {
    if (!newTitle.trim()) {
      toast.error('El título de la lista no puede estar vacío')
      return
    }

    if (newTitle.trim() === list.title) {
      setIsRenaming(false)
      return
    }

    startTransition(async () => {
      const result = await updateList({
        id: list.id,
        title: newTitle.trim(),
      })

      if (result.success) {
        toast.success('Lista renombrada correctamente')
        setIsRenaming(false)
      } else {
        toast.error(result.error ?? 'Error al renombrar la lista')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirmRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelRename()
    }
  }

  return (
    <div className='shrink-0 w-72 sm:w-80'>
      <Card
        className={cn(
          'h-full flex flex-col bg-muted/50 transition-all duration-200',
          isOver &&
            'ring-2 ring-primary ring-offset-2 bg-primary/5 shadow-lg scale-[1.02]',
        )}
      >
        <CardHeader
          className='pb-2 md:pb-3 border-b-2'
          style={{
            borderColor: board.backgroundColor ?? '#0079bf',
          }}
        >
          {isRenaming ? (
            <div className='flex items-center gap-1'>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                autoFocus
                className='h-8 md:h-9 text-base md:text-lg font-semibold font-sans flex-1'
              />
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-8 md:h-9 md:w-9 p-0 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900 dark:hover:border-green-700 dark:text-green-400'
                onClick={handleConfirmRename}
                disabled={isPending}
                aria-label='Confirmar cambio de nombre'
              >
                {isPending ? (
                  <Spinner className='h-3.5 w-3.5 md:h-4 md:w-4' />
                ) : (
                  <Check className='h-3.5 w-3.5 md:h-4 md:w-4' />
                )}
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-8 md:h-9 md:w-9 p-0 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900 dark:hover:border-red-700 dark:text-red-400'
                onClick={handleCancelRename}
                disabled={isPending}
                aria-label='Cancelar cambio de nombre'
              >
                <X className='h-3.5 w-3.5 md:h-4 md:w-4' />
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between gap-2'>
              <CardTitle className='text-base md:text-lg font-semibold font-sans truncate'>
                {list.title}
              </CardTitle>
              <ListActionsMenu
                listId={list.id}
                listTitle={list.title}
                onRenameAction={handleRename}
              />
            </div>
          )}
        </CardHeader>
        <CardContent
          ref={setNodeRef}
          className='flex-1 flex flex-col gap-2 overflow-y-auto p-3 md:p-6'
        >
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {/* Cards */}
            {list.cards.length > 0 ? (
              <div className='space-y-2'>
                {list.cards.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className='text-xs md:text-sm text-muted-foreground text-center py-3 md:py-4'>
                No hay tarjetas aún
              </p>
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}
