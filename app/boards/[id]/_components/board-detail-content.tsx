'use client'

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useState } from 'react'
import type { TBoard } from '@/lib/board/types'
import type { TCard } from '@/lib/card/types'
import type { TListWithCards } from '@/lib/list/types'
import { useBoardStore } from '@/store/board-store'
import { useDragAndDrop } from '../_hooks/use-drag-and-drop'
import { AddBoardMemberDialog } from './add-board-member-dialog'
import { CardDetailDialog } from './card-detail-dialog'
import { CardItem } from './card-item'
import { CreateListDialog } from './create-list-dialog'
import { DroppableList } from './droppable-list'

type TBoardDetailContentProps = {
  board: TBoard
  lists: TListWithCards[]
  currentUserId: string
}

/**
 * Main board detail component with drag-and-drop functionality.
 * Displays board header, lists, and cards with support for:
 * - Mouse/touch drag and drop
 * - Keyboard navigation (WCAG 2.1 AA compliant)
 * - Optimistic UI updates
 * - Automatic error recovery
 *
 * @param board - The board data including title, description, and color
 * @param lists - Array of lists with their cards
 */
export function BoardDetailContent({
  board,
  lists,
  currentUserId,
}: TBoardDetailContentProps) {
  const [activeCard, setActiveCard] = useState<TCard | null>(null)
  const { activeCard: activeCardId } = useBoardStore()

  // Use custom hook for drag and drop logic
  const { optimisticLists, handleDragStart, handleDragEnd } =
    useDragAndDrop(lists)

  // Find the active card for the modal
  const activeCardForModal = optimisticLists
    .flatMap((list) => list.cards)
    .find((card) => card.id === activeCardId)

  // Configure sensors with keyboard support for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Wrapper for drag start to set active card for overlay
  const onDragStart = useCallback(
    (event: Parameters<typeof handleDragStart>[0]) => {
      const card = handleDragStart(event)
      setActiveCard(card)
    },
    [handleDragStart],
  )

  // Wrapper for drag end to clear active card
  const onDragEnd = useCallback(
    async (event: Parameters<typeof handleDragEnd>[0]) => {
      await handleDragEnd(event)
      setActiveCard(null)
    },
    [handleDragEnd],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className='h-full flex flex-col bg-background'>
        {/* Board Header with Color Bar */}
        <div
          className='border-b-4 px-6 py-4'
          style={{
            borderColor: board.backgroundColor ?? '#0079bf',
          }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className='w-1 h-8 rounded-full'
                style={{
                  backgroundColor: board.backgroundColor ?? '#0079bf',
                }}
              />
              <div>
                <h1 className='text-3xl font-display font-bold text-foreground tracking-tight'>
                  {board.title}
                </h1>
                {board.description && (
                  <p className='text-muted-foreground text-sm mt-1.5 font-sans'>
                    {board.description}
                  </p>
                )}
              </div>
            </div>

            {/* Botón de colaboradores (solo visible para el propietario) */}
            <AddBoardMemberDialog
              boardId={board.id}
              ownerId={board.ownerId}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* Lists Container with Horizontal Scroll */}
        <div className='flex-1 flex gap-4 overflow-x-auto p-6'>
          {optimisticLists.map((list) => (
            <DroppableList key={list.id} list={list} board={board} />
          ))}

          {/* Add List Button */}
          <CreateListDialog boardId={board.id} />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} /> : null}
      </DragOverlay>

      {/* Card Detail Modal - Rendered at board level */}
      {activeCardForModal && <CardDetailDialog card={activeCardForModal} />}
    </DndContext>
  )
}
