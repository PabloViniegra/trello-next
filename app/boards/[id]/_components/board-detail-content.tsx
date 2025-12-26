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
import { Lock } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import type { TBoard } from '@/lib/board/types'
import type { TCardWithDetails } from '@/lib/card/types'
import type { TLabelWithCardCount } from '@/lib/label/types'
import type { TListWithCardsAndLabels } from '@/lib/list/types'
import { useBoardStore } from '@/store/board-store'
import { useDragAndDrop } from '../_hooks/use-drag-and-drop'
import { ActivitySheet } from './activity-sheet'
import { AddBoardMemberDialog } from './add-board-member-dialog'
import { BoardPrivacyToggle } from './board-privacy-toggle'
import { CardDetailDialog } from './card-detail-dialog'
import { CardItem } from './card-item'
import { CreateListDialog } from './create-list-dialog'
import { DroppableList } from './droppable-list'
import { EditBoardDialog } from './edit-board-dialog'
import { LabelManagerDialog } from './label-manager-dialog'

type TBoardDetailContentProps = {
  board: TBoard
  lists: TListWithCardsAndLabels[]
  labels: TLabelWithCardCount[]
  currentUserId: string
  initialActivities?: TActivityLogWithUser[]
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
  labels,
  currentUserId,
  initialActivities = [],
}: TBoardDetailContentProps) {
  const [activeCard, setActiveCard] = useState<TCardWithDetails | null>(null)
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
  const _onDragStart = useCallback(
    (event: Parameters<typeof handleDragStart>[0]) => {
      const card = handleDragStart(event)
      setActiveCard(card)
    },
    [handleDragStart],
  )

  // Wrapper for drag end to clear active card
  const _onDragEnd = useCallback(
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Main Content - Full Width */}
      <div className='h-full flex flex-col'>
        {/* Board Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl font-bold'>{board.title}</h1>

            {board.isPrivate && (
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                <Lock className='w-4 h-4' />
                Privado
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {/* Label Manager Dialog */}
            <LabelManagerDialog
              boardId={board.id}
              labels={labels}
              isOwner={currentUserId === board.ownerId}
            />

            {/* Edit Board Dialog */}
            <EditBoardDialog
              board={board}
              isOwner={currentUserId === board.ownerId}
            />

            {/* Add Member Dialog */}
            <AddBoardMemberDialog
              boardId={board.id}
              ownerId={board.ownerId}
              currentUserId={currentUserId}
            />

            {/* Botón de privacidad (solo visible para el propietario) */}
            <BoardPrivacyToggle
              boardId={board.id}
              currentPrivacy={board.isPrivate}
              isOwner={currentUserId === board.ownerId}
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

      {/* Floating Activity Sheet Button */}
      <ActivitySheet boardId={board.id} initialActivities={initialActivities} />

      <DragOverlay>
        {activeCard ? <CardItem card={activeCard} /> : null}
      </DragOverlay>

      {/* Card Detail Modal - Rendered at board level */}
      {activeCardForModal && (
        <CardDetailDialog
          card={activeCardForModal}
          boardLabels={labels}
          boardId={board.id}
        />
      )}
    </DndContext>
  )
}
