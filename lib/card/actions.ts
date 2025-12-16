'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { card, list } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import type {
  TCreateCardInput,
  TDeleteCardInput,
  TMoveCardInput,
  TUpdateCardInput,
} from './schemas'
import {
  createCardSchema,
  deleteCardSchema,
  moveCardSchema,
  updateCardSchema,
} from './schemas'

export type TCardResult = {
  success: boolean
  data?: { id: string; title: string }
  error?: string
}

export type TDeleteCardResult = {
  success: boolean
  error?: string
}

export type TMoveCardResult = {
  success: boolean
  error?: string
}

export async function createCard(data: TCreateCardInput): Promise<TCardResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a card',
    }
  }

  // 2. Validate input data
  const validated = createCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Verify list exists and user has access
    const listRecord = await db.query.list.findFirst({
      where: eq(list.id, validated.data.listId),
      with: {
        board: true,
      },
    })

    if (!listRecord) {
      return {
        success: false,
        error: 'List not found',
      }
    }

    if (listRecord.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to add cards to this list',
      }
    }

    // 4. Generate unique ID
    const cardId = crypto.randomUUID()

    // 5. Insert into database with atomic position calculation
    const newCard = await db.transaction(
      async (tx) => {
        // Lock the list row to prevent concurrent card creations
        await tx
          .select({ id: list.id })
          .from(list)
          .where(eq(list.id, validated.data.listId))
          .for('update')

        // Get the next position
        const maxPosition = await tx
          .select({ max: sql<number>`COALESCE(MAX(${card.position}), -1)` })
          .from(card)
          .where(eq(card.listId, validated.data.listId))

        const nextPosition = (maxPosition[0]?.max ?? -1) + 1

        // Insert the new card
        const [created] = await tx
          .insert(card)
          .values({
            id: cardId,
            title: validated.data.title,
            description: validated.data.description ?? null,
            listId: validated.data.listId,
            position: nextPosition,
            dueDate: validated.data.dueDate ?? null,
          })
          .returning({ id: card.id, title: card.title })

        return created
      },
      {
        isolationLevel: 'serializable',
      },
    )

    // 6. Revalidate board detail page
    revalidatePath(`/boards/${listRecord.boardId}`)

    return {
      success: true,
      data: newCard,
    }
  } catch (error) {
    logError(error, 'Error creating card')
    return {
      success: false,
      error: 'Failed to create card',
    }
  }
}

export async function updateCard(data: TUpdateCardInput): Promise<TCardResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to update a card',
    }
  }

  // 2. Validate input data
  const validated = updateCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Get the card and verify board ownership
    const cardRecord = await db.query.card.findFirst({
      where: eq(card.id, validated.data.id),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    })

    if (!cardRecord) {
      return {
        success: false,
        error: 'Card not found',
      }
    }

    if (cardRecord.list.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to update this card',
      }
    }

    // 4. Update the card
    const [updatedCard] = await db
      .update(card)
      .set({
        ...(validated.data.title && { title: validated.data.title }),
        ...(validated.data.description !== undefined && {
          description: validated.data.description,
        }),
        ...(validated.data.position !== undefined && {
          position: validated.data.position,
        }),
        ...(validated.data.dueDate !== undefined && {
          dueDate: validated.data.dueDate,
        }),
        ...(validated.data.listId && { listId: validated.data.listId }),
      })
      .where(eq(card.id, validated.data.id))
      .returning({ id: card.id, title: card.title })

    // 5. Revalidate board detail page
    revalidatePath(`/boards/${cardRecord.list.boardId}`)

    return {
      success: true,
      data: updatedCard,
    }
  } catch (error) {
    logError(error, 'Error updating card')
    return {
      success: false,
      error: 'Failed to update card',
    }
  }
}

export async function deleteCard(
  data: TDeleteCardInput,
): Promise<TDeleteCardResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to delete a card',
    }
  }

  // 2. Validate input data
  const validated = deleteCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Get the card and verify board ownership
    const cardRecord = await db.query.card.findFirst({
      where: eq(card.id, validated.data.id),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    })

    if (!cardRecord) {
      return {
        success: false,
        error: 'Card not found',
      }
    }

    if (cardRecord.list.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to delete this card',
      }
    }

    // 4. Delete the card
    await db.delete(card).where(eq(card.id, validated.data.id))

    // 5. Revalidate board detail page
    revalidatePath(`/boards/${cardRecord.list.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'Error deleting card')
    return {
      success: false,
      error: 'Failed to delete card',
    }
  }
}

/**
 * Moves a card to a different list or position within the same list.
 * Uses database transactions to prevent race conditions during concurrent moves.
 *
 * Security:
 * - Validates user authentication
 * - Verifies board ownership
 * - Ensures target list belongs to the same board
 * - Uses Zod schema validation
 *
 * Performance:
 * - Uses serializable transaction isolation
 * - Locks target list to prevent position conflicts
 *
 * @param data - Card ID, target list ID, and new position
 * @returns Success status with optional error message
 *
 * @example
 * ```ts
 * const result = await moveCardAction({
 *   cardId: 'card-123',
 *   targetListId: 'list-456',
 *   position: 2
 * })
 * if (result.success) {
 *   toast.success('Card moved')
 * }
 * ```
 */
export async function moveCardAction(
  data: TMoveCardInput,
): Promise<TMoveCardResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to move a card',
    }
  }

  // 2. Validate input data
  const validated = moveCardSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Get the card and verify board ownership
    const cardRecord = await db.query.card.findFirst({
      where: eq(card.id, validated.data.cardId),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    })

    if (!cardRecord) {
      return {
        success: false,
        error: 'Card not found',
      }
    }

    if (cardRecord.list.board.ownerId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to move this card',
      }
    }

    // 4. Verify target list exists and belongs to the same board
    const targetListRecord = await db.query.list.findFirst({
      where: eq(list.id, validated.data.targetListId),
      with: {
        board: true,
      },
    })

    if (!targetListRecord) {
      return {
        success: false,
        error: 'Target list not found',
      }
    }

    if (targetListRecord.boardId !== cardRecord.list.boardId) {
      return {
        success: false,
        error: 'Cannot move card to a different board',
      }
    }

    // 5. Update the card in a transaction to prevent race conditions
    await db.transaction(
      async (tx) => {
        // Lock the target list to prevent concurrent position conflicts
        await tx
          .select({ id: list.id })
          .from(list)
          .where(eq(list.id, validated.data.targetListId))
          .for('update')

        // Update the card position and list
        await tx
          .update(card)
          .set({
            listId: validated.data.targetListId,
            position: validated.data.position,
          })
          .where(eq(card.id, validated.data.cardId))
      },
      {
        isolationLevel: 'serializable',
      },
    )

    // 6. Revalidate board detail page
    revalidatePath(`/boards/${cardRecord.list.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'Error moving card')
    return {
      success: false,
      error: 'Failed to move card',
    }
  }
}
