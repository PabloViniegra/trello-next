'use client'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import { toast } from 'sonner'
import { moveCardAction } from '@/lib/card/actions'
import type { TCardWithDetails } from '@/lib/card/types'
import type { TListWithCardsAndLabels } from '@/lib/list/types'

type TCardLocation = {
  listId: string
  card: TCardWithDetails
}

/**
 * Custom hook for managing drag and drop functionality in board lists.
 *
 * Uses a two-layer state approach:
 * 1. useState for synced lists (from SSE or server)
 * 2. useOptimistic for drag & drop operations only
 *
 * This prevents the error: "optimistic state update outside transition"
 *
 * @param syncedLists - The synced lists from SSE/server (changes trigger re-render)
 * @returns Drag and drop handlers and optimistic state
 */
export function useDragAndDrop(syncedLists: TListWithCardsAndLabels[]) {
  const [isPending, startTransition] = useTransition()

  // Base state - updates when SSE sends new data
  const [baseLists, setBaseLists] =
    useState<TListWithCardsAndLabels[]>(syncedLists)

  // Optimistic state - ONLY for drag & drop operations
  const [optimisticLists, setOptimisticLists] =
    useOptimistic<TListWithCardsAndLabels[]>(baseLists)

  // Sync base lists when SSE updates arrive
  // Use ref to track previous data and compare
  const prevSyncedListsRef = useRef<string>('')

  useEffect(() => {
    const currentKey = JSON.stringify(
      syncedLists.map((l) => ({
        id: l.id,
        title: l.title,
        cardCount: l.cards.length,
        cardIds: l.cards.map((c) => c.id),
      })),
    )

    if (currentKey !== prevSyncedListsRef.current) {
      prevSyncedListsRef.current = currentKey
      setBaseLists(syncedLists)
    }
  }, [syncedLists])

  // Create lookup maps for O(1) access
  const createLookupMaps = useCallback((lists: TListWithCardsAndLabels[]) => {
    const cardToList = new Map<string, string>()
    const listMap = new Map<string, TListWithCardsAndLabels>()

    for (const list of lists) {
      listMap.set(list.id, list)
      for (const card of list.cards) {
        cardToList.set(card.id, list.id)
      }
    }

    return { cardToList, listMap }
  }, [])

  /**
   * Finds a card and its containing list using efficient lookup.
   */
  const findCard = useCallback(
    (
      cardId: string,
      lists: TListWithCardsAndLabels[],
    ): TCardLocation | null => {
      const { cardToList, listMap } = createLookupMaps(lists)
      const listId = cardToList.get(cardId)

      if (!listId) return null

      const list = listMap.get(listId)
      const card = list?.cards.find((c) => c.id === cardId)

      if (!card) return null

      return { listId, card }
    },
    [createLookupMaps],
  )

  /**
   * Handles the start of a drag operation.
   */
  const handleDragStart = (event: DragStartEvent): TCardWithDetails | null => {
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
  const handleDragEnd = useCallback(
    async (event: DragEndEvent): Promise<void> => {
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
            members: draggedCard.members || [],
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
            toast.success('Tarjeta movida correctamente')
          }
        } else {
          toast.error(result.error ?? 'Error al mover la tarjeta')
          // Optimistic update will be reverted automatically by Next.js
        }
      })
    },
    [findCard, optimisticLists, setOptimisticLists, createLookupMaps],
  )

  return {
    optimisticLists,
    handleDragStart,
    handleDragEnd,
    isPending,
  }
}
