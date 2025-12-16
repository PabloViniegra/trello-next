'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TBoard } from '@/lib/board/types'
import type { TListWithCards } from '@/lib/list/types'
import { cn } from '@/lib/utils'
import { CreateCardDialog } from './create-card-dialog'
import { DraggableCard } from './draggable-card'

type TDroppableListProps = {
  list: TListWithCards
  board: TBoard
}

/**
 * A droppable list container that accepts draggable cards.
 * Displays list title, cards, and "Add Card" button.
 *
 * @param list - The list data with its cards
 * @param board - The parent board (used for styling)
 */
export function DroppableList({ list, board }: TDroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const cardIds = useMemo(() => list.cards.map((card) => card.id), [list.cards])

  return (
    <div className='shrink-0 w-80'>
      <Card
        className={cn(
          'h-full flex flex-col bg-muted/50 transition-all duration-200',
          isOver && 'ring-2 ring-primary ring-offset-2 bg-muted/70',
        )}
      >
        <CardHeader
          className='pb-3 border-b-2'
          style={{
            borderColor: board.backgroundColor ?? '#0079bf',
          }}
        >
          <CardTitle className='text-lg font-semibold font-sans'>
            {list.title}
          </CardTitle>
        </CardHeader>
        <CardContent
          ref={setNodeRef}
          className='flex-1 flex flex-col gap-2 overflow-y-auto'
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
              <p className='text-sm text-muted-foreground text-center py-4'>
                No cards yet
              </p>
            )}
          </SortableContext>

          {/* Add Card Button */}
          <div className='mt-auto pt-2'>
            <CreateCardDialog listId={list.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
