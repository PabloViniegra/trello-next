'use client'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { moveCardAction } from '@/lib/card/actions'
import type { TCard } from '@/lib/card/types'
import type { TListWithCards } from '@/lib/list/types'

type TCardLocation = {
  listId: string
  card: TCard
}

/**
 * Custom hook for managing drag and drop functionality in board lists.
 * Handles optimistic updates, card movement, and error recovery.
 *
 * @param initialLists - The initial lists with cards from the server
 * @returns Drag and drop handlers and optimistic state
 */
export function useDragAndDrop(initialLists: TListWithCards[]) {
  const [isPending, startTransition] = useTransition()
  const [optimisticLists, setOptimisticLists] =
    useOptimistic<TListWithCards[]>(initialLists)

  // Create lookup maps for O(1) access
  const createLookupMaps = (lists: TListWithCards[]) => {
    const cardToList = new Map<string, string>()
    const listMap = new Map<string, TListWithCards>()

    for (const list of lists) {
      listMap.set(list.id, list)
      for (const card of list.cards) {
        cardToList.set(card.id, list.id)
      }
    }

    return { cardToList, listMap }
  }

  /**
   * Finds a card and its containing list using efficient lookup.
   */
  const findCard = (
    cardId: string,
    lists: TListWithCards[],
  ): TCardLocation | null => {
    const { cardToList, listMap } = createLookupMaps(lists)
    const listId = cardToList.get(cardId)

    if (!listId) return null

    const list = listMap.get(listId)
    const card = list?.cards.find((c) => c.id === cardId)

    if (!card) return null

    return { listId, card }
  }

  /**
   * Handles the start of a drag operation.
   */
  const handleDragStart = (event: DragStartEvent): TCard | null => {
    const cardId = event.active.id

    // Type guard: ensure id is a string
    if (typeof cardId !== 'string') {
      console.error('Invalid card ID type:', typeof cardId)
      return null
    }

    const location = findCard(cardId, optimisticLists)
    return location?.card ?? null
  }

  /**
   * Handles the end of a drag operation with optimistic updates.
   */
  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event

    if (!over) return

    const cardId = active.id
    const overId = over.id

    // Type guards
    if (typeof cardId !== 'string' || typeof overId !== 'string') {
      console.error('Invalid ID types')
      return
    }

    // Find source card and list
    const sourceLocation = findCard(cardId, optimisticLists)
    if (!sourceLocation) return

    const { listId: sourceListId, card: draggedCard } = sourceLocation

    // Determine target list
    let targetListId = sourceListId
    const { listMap } = createLookupMaps(optimisticLists)

    // Check if dropped over a list
    if (listMap.has(overId)) {
      targetListId = overId
    } else {
      // Check if dropped over a card
      const overLocation = findCard(overId, optimisticLists)
      if (overLocation) {
        targetListId = overLocation.listId
      }
    }

    // If same position, do nothing
    if (sourceListId === targetListId && cardId === overId) {
      return
    }

    // Calculate new position BEFORE creating optimistic update
    let newPosition = 0

    if (sourceListId === targetListId) {
      // Reordering within the same list
      const currentList = optimisticLists.find((l) => l.id === targetListId)
      if (currentList) {
        const targetCardIndex = currentList.cards.findIndex(
          (c) => c.id === overId,
        )
        if (targetCardIndex >= 0) {
          newPosition = targetCardIndex
        } else {
          // Dropped on the list itself, put at the end
          newPosition = currentList.cards.length - 1
        }
      }
    } else {
      // Moving to a different list
      const targetList = optimisticLists.find((l) => l.id === targetListId)
      if (targetList) {
        const targetCardIndex = targetList.cards.findIndex(
          (c) => c.id === overId,
        )
        if (targetCardIndex >= 0) {
          newPosition = targetCardIndex
        } else {
          // Dropped on the list itself, put at the end
          newPosition = targetList.cards.length
        }
      }
    }

    // Create optimistic update
    const updatedLists = optimisticLists.map((list) => {
      if (list.id === sourceListId && list.id === targetListId) {
        // Reordering within the same list
        const newCards = [...list.cards]
        const oldIndex = newCards.findIndex((c) => c.id === cardId)

        if (oldIndex >= 0) {
          // Remove from old position
          const [movedCard] = newCards.splice(oldIndex, 1)
          // Insert at new position
          newCards.splice(newPosition, 0, movedCard)
        }

        return { ...list, cards: newCards }
      }

      if (list.id === sourceListId) {
        // Remove card from source list
        return {
          ...list,
          cards: list.cards.filter((c) => c.id !== cardId),
        }
      }

      if (list.id === targetListId) {
        // Add card to target list
        const newCards = [...list.cards]
        newCards.splice(newPosition, 0, {
          ...draggedCard,
          listId: targetListId,
        })

        return { ...list, cards: newCards }
      }

      return list
    })

    // Apply optimistic update and call server action
    startTransition(async () => {
      setOptimisticLists(updatedLists)

      const result = await moveCardAction({
        cardId,
        targetListId,
        position: newPosition,
      })

      if (result.success) {
        if (sourceListId !== targetListId) {
          toast.success('Card moved successfully')
        }
      } else {
        toast.error(result.error ?? 'Failed to move card')
        // Optimistic update will be reverted automatically by Next.js
      }
    })
  }

  return {
    optimisticLists,
    handleDragStart,
    handleDragEnd,
    isPending,
  }
}
