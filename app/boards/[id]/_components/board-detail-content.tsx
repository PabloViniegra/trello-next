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
import { Lock, MoreVertical } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TActivityLogWithUser } from '@/lib/activity/types'
import type { TBoard } from '@/lib/board/types'
import type { TCardWithDetails } from '@/lib/card/types'
import type { TLabelWithCardCount } from '@/lib/label/types'
import type { TListWithCardsAndLabels } from '@/lib/list/types'
import { useBoardStore } from '@/store/board-store'
import { useBoardStream } from '../_hooks/use-board-stream'
import { useDragAndDrop } from '../_hooks/use-drag-and-drop'
import { ActivitySheet } from './activity-sheet'
import { AddBoardMemberDialog } from './add-board-member-dialog'
import { BoardPrivacyToggle } from './board-privacy-toggle'
import { CardDetailDialog } from './card-detail-dialog'
import { CardItem } from './card-item'
import { CreateListDialog } from './create-list-dialog'
import { DeleteBoardButton } from './delete-board-button'
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
 * - Real-time synchronization via SSE
 *
 * @param board - The board data including title, description, and color
 * @param lists - Initial array of lists with their cards
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

  // Real-time board synchronization via polling
  const {
    lists: syncedLists,
    isConnected,
    lastUpdate,
  } = useBoardStream(board.id, lists)

  // Use custom hook for drag and drop logic with synced lists
  const { optimisticLists, handleDragStart, handleDragEnd } =
    useDragAndDrop(syncedLists)

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
      onDragStart={_onDragStart}
      onDragEnd={_onDragEnd}
    >
      {/* Main Content - Full Width */}
      <div className='h-full flex flex-col'>
        {/* Board Header */}
        <div className='flex items-center justify-between p-4 md:p-6 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 gap-3'>
          <div className='flex items-center gap-2 md:gap-4 min-w-0 flex-1'>
            <h1 className='text-lg md:text-2xl font-bold truncate'>
              {board.title}
            </h1>

            {board.isPrivate === 'private' && (
              <div className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-sm text-muted-foreground shrink-0'>
                <Lock className='w-3.5 h-3.5' />
                <span className='font-medium'>Privado</span>
              </div>
            )}

            {/* Real-time sync indicator */}
            <div
              className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs shrink-0'
              title={
                isConnected
                  ? `Sincronizado - Última actualización: ${new Date(lastUpdate).toLocaleTimeString()}`
                  : 'Desconectado - Refresca la página para ver cambios'
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className='font-medium text-muted-foreground'>
                {isConnected ? 'Sincronizado' : 'Sin conexión'}
              </span>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className='hidden md:flex items-center gap-2'>
            <LabelManagerDialog
              boardId={board.id}
              labels={labels}
              isOwner={currentUserId === board.ownerId}
            />
            <EditBoardDialog
              board={board}
              isOwner={currentUserId === board.ownerId}
            />
            <AddBoardMemberDialog
              boardId={board.id}
              ownerId={board.ownerId}
              currentUserId={currentUserId}
            />
            <BoardPrivacyToggle
              boardId={board.id}
              currentPrivacy={board.isPrivate}
              isOwner={currentUserId === board.ownerId}
            />
            <DeleteBoardButton
              board={board}
              isOwner={currentUserId === board.ownerId}
            />
          </div>

          {/* Mobile Actions - Dropdown Menu */}
          <div className='md:hidden'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9'
                  aria-label='Opciones del tablero'
                >
                  <MoreVertical className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64 p-2 space-y-2'>
                <LabelManagerDialog
                  boardId={board.id}
                  labels={labels}
                  isOwner={currentUserId === board.ownerId}
                />
                <EditBoardDialog
                  board={board}
                  isOwner={currentUserId === board.ownerId}
                />
                <AddBoardMemberDialog
                  boardId={board.id}
                  ownerId={board.ownerId}
                  currentUserId={currentUserId}
                />
                <BoardPrivacyToggle
                  boardId={board.id}
                  currentPrivacy={board.isPrivate}
                  isOwner={currentUserId === board.ownerId}
                />
                <DeleteBoardButton
                  board={board}
                  isOwner={currentUserId === board.ownerId}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Lists Container with Horizontal Scroll */}
        <div className='flex-1 flex gap-3 md:gap-4 overflow-x-auto p-4 md:p-6'>
          {optimisticLists.map((list) => (
            <DroppableList key={list.id} list={list} board={board} />
          ))}

          {/* Add List Button */}
          <CreateListDialog boardId={board.id} />
        </div>
      </div>

      {/* Floating Activity Sheet Button */}
      <ActivitySheet boardId={board.id} initialActivities={initialActivities} />

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeCard ? (
          <div className='rotate-3 scale-105 cursor-grabbing shadow-2xl'>
            <CardItem card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Card Detail Modal - Rendered at board level */}
      {activeCardForModal && (
        <CardDetailDialog
          card={activeCardForModal}
          boardLabels={labels}
          boardId={board.id}
          currentUserId={currentUserId}
          isBoardOwner={currentUserId === board.ownerId}
        />
      )}
    </DndContext>
  )
}
