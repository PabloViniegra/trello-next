'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useId, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { generateCardWithAI } from '@/lib/card/ai'
import { generateCardWithAISchema } from '@/lib/card/schemas'
import { cn } from '@/lib/utils'

type TGenerateCardAIDialogProps = {
  defaultListId?: string
  lists: Array<{ id: string; title: string }>
  /** When true, button spans full width (for mobile dropdown) */
  fullWidth?: boolean
}

type TFormData = z.infer<typeof generateCardWithAISchema>

/**
 * Dialog component for AI-powered card generation.
 *
 * Features:
 * - Text input for natural language prompt
 * - List selection (defaults to first list if not provided)
 * - Loading state with full-screen overlay
 * - Form validation with react-hook-form + Zod
 * - Accessible with proper ARIA labels
 *
 * UX Flow:
 * 1. User opens dialog and enters prompt
 * 2. Optionally selects target list
 * 3. Clicks "Generar" button
 * 4. Modal closes, loading overlay appears
 * 5. AI generates card content
 * 6. On success: toast notification
 * 7. On error: modal reopens for retry
 *
 * @param defaultListId - Optional default list for the card
 * @param lists - Available lists for selection
 * @param fullWidth - When true, button spans full width (for mobile dropdown)
 */
export function GenerateCardAIDialog({
  defaultListId,
  lists,
  fullWidth = false,
}: TGenerateCardAIDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const promptId = useId()
  const listId = useId()

  // Use first list as default if no defaultListId provided
  const initialListId = defaultListId || lists[0]?.id || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TFormData>({
    resolver: zodResolver(generateCardWithAISchema),
    defaultValues: {
      prompt: '',
      listId: initialListId,
    },
  })

  const onSubmit = (data: TFormData) => {
    // Close modal immediately to show loading overlay
    setOpen(false)

    startTransition(async () => {
      const result = await generateCardWithAI(data)

      if (result.success && result.data) {
        toast.success(`Tarjeta creada: ${result.data.title}`)
        reset()
      } else {
        toast.error(result.error || 'Error al generar la tarjeta')
        // Reopen modal on error so user can retry
        setOpen(true)
      }
    })
  }

  return (
    <>
      {/* Loading overlay - rendered in portal to avoid layout issues */}
      {isPending &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <Spinner className='h-12 w-12 text-primary' />
              <div>
                <p className='text-lg font-semibold'>
                  Generando tarjeta con IA...
                </p>
                <p className='text-sm text-muted-foreground'>
                  Esto puede tardar unos segundos
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='w-full justify-start gap-2 hover:bg-accent/50 border border-transparent hover:border-border transition-all'
            aria-label='Generar tarjeta con IA'
          >
            <Sparkles className='h-4 w-4' aria-hidden='true' />
            <span className='font-medium'>Generar con IA</span>
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-primary' aria-hidden='true' />
              Generar Tarjeta con IA
            </DialogTitle>
            <DialogDescription>
              Describe la tarjeta que quieres crear y la IA la generará por ti.
              Puedes incluir detalles como título, descripción y fecha de
              vencimiento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Prompt Input */}
            <div className='space-y-2'>
              <Label htmlFor={promptId}>
                Descripción <span className='text-destructive'>*</span>
              </Label>
              <Input
                id={promptId}
                placeholder='Ej: Crear una tarea para revisar el código del proyecto frontend antes del viernes'
                {...register('prompt')}
                disabled={isPending}
                aria-invalid={!!errors.prompt}
                aria-describedby={
                  errors.prompt ? `${promptId}-error` : undefined
                }
                className='w-full'
              />
              {errors.prompt && (
                <p
                  id={`${promptId}-error`}
                  className='text-sm text-destructive'
                  role='alert'
                >
                  {errors.prompt.message}
                </p>
              )}
            </div>

            {/* List Selection */}
            <div className='space-y-2'>
              <Label htmlFor={listId}>
                Lista de destino <span className='text-destructive'>*</span>
              </Label>
              <select
                id={listId}
                {...register('listId')}
                disabled={isPending}
                aria-invalid={!!errors.listId}
                aria-describedby={errors.listId ? `${listId}-error` : undefined}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
              {errors.listId && (
                <p
                  id={`${listId}-error`}
                  className='text-sm text-destructive'
                  role='alert'
                >
                  {errors.listId.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false)
                  reset()
                }}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending} className='gap-2'>
                {isPending ? (
                  <>
                    <Spinner className='h-4 w-4' aria-hidden='true' />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' aria-hidden='true' />
                    Generar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
