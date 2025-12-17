'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/db'
import { board, list } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { logError } from '@/lib/errors'
import type {
  TCreateListInput,
  TDeleteListInput,
  TUpdateListInput,
} from './schemas'
import { createListSchema, deleteListSchema, updateListSchema } from './schemas'

export type TListResult = {
  success: boolean
  data?: { id: string; title: string }
  error?: string
}

export type TDeleteListResult = {
  success: boolean
  error?: string
}

export async function createList(data: TCreateListInput): Promise<TListResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create a list',
    }
  }

  // 2. Validate input data
  const validated = createListSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Verify board ownership
    const boardRecord = await db.query.board.findFirst({
      where: eq(board.id, validated.data.boardId),
    })

    if (!boardRecord) {
      return {
        success: false,
        error: 'Board not found',
      }
    }

    if (boardRecord.ownerId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to add lists to this board',
      }
    }

    // 4. Generate unique ID
    const listId = crypto.randomUUID()

    // 5. Insert into database with atomic position calculation
    const newList = await db.transaction(
      async (tx) => {
        // Lock the board row to prevent concurrent list creations
        await tx
          .select({ id: board.id })
          .from(board)
          .where(eq(board.id, validated.data.boardId))
          .for('update')

        // Get the next position
        const maxPosition = await tx
          .select({ max: sql<number>`COALESCE(MAX(${list.position}), -1)` })
          .from(list)
          .where(eq(list.boardId, validated.data.boardId))

        const nextPosition = (maxPosition[0]?.max ?? -1) + 1

        // Insert the new list
        const [created] = await tx
          .insert(list)
          .values({
            id: listId,
            title: validated.data.title,
            boardId: validated.data.boardId,
            position: nextPosition,
          })
          .returning({ id: list.id, title: list.title })

        return created
      },
      {
        isolationLevel: 'serializable',
      },
    )

    // 6. Revalidate board detail page - DESPUÉS de transacción exitosa
    revalidateTag(`board:${validated.data.boardId}:lists`, { expire: 0 })
    revalidatePath(`/boards/${validated.data.boardId}`)

    return {
      success: true,
      data: newList,
    }
  } catch (error) {
    logError(error, 'Error creating list')
    return {
      success: false,
      error: 'Failed to create list',
    }
  }
}

export async function updateList(data: TUpdateListInput): Promise<TListResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to update a list',
    }
  }

  // 2. Validate input data
  const validated = updateListSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Get the list and verify board ownership
    const listRecord = await db.query.list.findFirst({
      where: eq(list.id, validated.data.id),
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
        error: 'You do not have permission to update this list',
      }
    }

    // 4. Update the list
    const [updatedList] = await db
      .update(list)
      .set({
        ...(validated.data.title && { title: validated.data.title }),
        ...(validated.data.position !== undefined && {
          position: validated.data.position,
        }),
      })
      .where(eq(list.id, validated.data.id))
      .returning({ id: list.id, title: list.title })

    // 5. Revalidate board detail page - DESPUÉS de mutación exitosa
    revalidateTag(`board:${listRecord.boardId}:lists`, { expire: 0 })
    revalidatePath(`/boards/${listRecord.boardId}`)

    return {
      success: true,
      data: updatedList,
    }
  } catch (error) {
    logError(error, 'Error updating list')
    return {
      success: false,
      error: 'Failed to update list',
    }
  }
}

export async function deleteList(
  data: TDeleteListInput,
): Promise<TDeleteListResult> {
  // 1. Verify authentication
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to delete a list',
    }
  }

  // 2. Validate input data
  const validated = deleteListSchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Invalid data',
    }
  }

  try {
    // 3. Get the list and verify board ownership
    const listRecord = await db.query.list.findFirst({
      where: eq(list.id, validated.data.id),
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
        error: 'You do not have permission to delete this list',
      }
    }

    // 4. Delete the list (cards will be cascade deleted)
    await db.delete(list).where(eq(list.id, validated.data.id))

    // 5. Revalidate board detail page - DESPUÉS de mutación exitosa
    revalidateTag(`board:${listRecord.boardId}:lists`, { expire: 0 })
    revalidatePath(`/boards/${listRecord.boardId}`)

    return {
      success: true,
    }
  } catch (error) {
    logError(error, 'Error deleting list')
    return {
      success: false,
      error: 'Failed to delete list',
    }
  }
}
