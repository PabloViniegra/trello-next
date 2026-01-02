'use server'

import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { list } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth/get-user'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { env } from '@/lib/env'
import { logError } from '@/lib/errors'
import { createCard } from './actions'
import {
  generateCardWithAISchema,
  type TGenerateCardWithAIInput,
} from './schemas'

export type TGenerateCardWithAIResult = {
  success: boolean
  data?: { id: string; title: string }
  error?: string
}

/**
 * Schema for AI-generated card content
 * Defines the structure that the AI must return
 */
const aiCardSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título debe tener menos de 255 caracteres')
    .describe(
      'Un título breve y descriptivo para la tarjeta (máximo 255 caracteres)',
    ),
  description: z
    .string()
    .optional()
    .describe('Una descripción detallada opcional de la tarjeta'),
  dueDate: z
    .string()
    .optional()
    .describe(
      'Fecha de vencimiento en formato ISO 8601 (YYYY-MM-DD) si es relevante',
    ),
})

/**
 * Generates a card using AI based on a natural language prompt.
 *
 * Flow:
 * 1. Validates user input (prompt and listId)
 * 2. Calls Groq AI with structured output schema
 * 3. AI returns JSON matching the card schema
 * 4. Creates the card using the existing createCard action
 *
 * Security:
 * - Validates all inputs with Zod schemas
 * - Uses server-side authentication (via createCard)
 * - AI output is validated against strict schema
 * - No direct database access from AI
 *
 * @param data - User prompt and target list ID
 * @returns Result with created card data or error message
 *
 * @example
 * ```ts
 * const result = await generateCardWithAI({
 *   prompt: 'Crear una tarea para revisar el código del proyecto',
 *   listId: 'list-123'
 * })
 * if (result.success) {
 *   toast.success(`Tarjeta creada: ${result.data.title}`)
 * }
 * ```
 */
export async function generateCardWithAI(
  data: TGenerateCardWithAIInput,
): Promise<TGenerateCardWithAIResult> {
  // 1. Verify authentication FIRST (before consuming API resources)
  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para generar tarjetas con IA',
    }
  }

  // 2. Validate input data
  const validated = generateCardWithAISchema.safeParse(data)

  if (!validated.success) {
    const firstError = validated.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? 'Datos inválidos',
    }
  }

  // 3. Validate list exists and user has access BEFORE calling AI
  const targetList = await db.query.list.findFirst({
    where: eq(list.id, validated.data.listId),
    with: {
      board: true,
    },
  })

  if (!targetList) {
    return {
      success: false,
      error: 'La lista no existe',
    }
  }

  const hasAccess = await hasUserBoardAccess(targetList.boardId, user.id)

  if (!hasAccess) {
    return {
      success: false,
      error: 'No tienes permiso para añadir tarjetas a esta lista',
    }
  }

  // 4. Check if GROQ API key is configured
  if (!env.GROQ_API_KEY) {
    return {
      success: false,
      error: 'La generación con IA no está disponible en este momento',
    }
  }

  try {
    // 3. Generate card content with AI
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `Genera una tarjeta de tarea basada en la siguiente descripción del usuario: "${validated.data.prompt}"

Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "Título breve y descriptivo (máximo 255 caracteres)",
  "description": "Descripción detallada opcional",
  "dueDate": "YYYY-MM-DD (opcional, solo si se menciona explícitamente)"
}

IMPORTANTE: 
- El título debe ser breve y descriptivo (máximo 255 caracteres)
- La descripción debe ser detallada y profesional
- Solo incluye dueDate si el usuario la menciona explícitamente
- El formato de fecha debe ser YYYY-MM-DD
- Responde SOLO con el JSON, sin texto adicional
- Todo el contenido debe estar en español`,
    })

    // Parse AI response as JSON
    let aiCard: z.infer<typeof aiCardSchema>
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      const parsed = JSON.parse(cleanedText)

      // Validate with Zod schema
      aiCard = aiCardSchema.parse(parsed)
    } catch (parseError) {
      logError(parseError, 'Error parsing AI response')
      return {
        success: false,
        error:
          'La IA generó una respuesta inválida. Por favor, intenta de nuevo.',
      }
    }

    // 4. Parse and validate dueDate if provided
    let parsedDueDate: Date | undefined
    if (aiCard.dueDate) {
      try {
        parsedDueDate = new Date(aiCard.dueDate)
        // Validate that the date is valid
        if (Number.isNaN(parsedDueDate.getTime())) {
          parsedDueDate = undefined
        }
      } catch {
        // If date parsing fails, ignore it
        parsedDueDate = undefined
      }
    }

    // 5. Create the card using the existing createCard action
    // This ensures all business logic, validation, and security checks are applied
    const result = await createCard({
      title: aiCard.title,
      description: aiCard.description ?? undefined,
      listId: validated.data.listId,
      dueDate: parsedDueDate,
    })

    return result
  } catch (error) {
    logError(error, 'Error generating card with AI')
    return {
      success: false,
      error: 'Error al generar la tarjeta con IA. Por favor, intenta de nuevo.',
    }
  }
}
