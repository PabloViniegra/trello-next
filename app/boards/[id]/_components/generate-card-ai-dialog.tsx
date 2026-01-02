'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Lightbulb, ListTodo, Sparkles, Wand2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
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

// Example prompts to help users understand what they can ask
const EXAMPLE_PROMPTS = [
  'Revisar el código del módulo de autenticación',
  'Diseñar la nueva página de inicio',
  'Investigar opciones de hosting para el proyecto',
]

/**
 * Dialog component for AI-powered card generation.
 *
 * Features:
 * - Textarea for natural language prompt with example suggestions
 * - List selection with Shadcn Select component
 * - Loading state with full-screen overlay
 * - Form validation with react-hook-form + Zod
 * - Accessible with proper ARIA labels
 * - Visual AI-themed header with gradient
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
    setValue,
    watch,
  } = useForm<TFormData>({
    resolver: zodResolver(generateCardWithAISchema),
    defaultValues: {
      prompt: '',
      listId: initialListId,
    },
  })

  const currentListId = watch('listId')

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

  const handleExampleClick = (example: string) => {
    setValue('prompt', example)
  }

  return (
    <>
      {/* Loading overlay - rendered in portal to avoid layout issues */}
      {isPending &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <div className='relative'>
                <div className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
                <div className='relative rounded-full bg-linear-to-br from-primary/20 to-secondary/20 p-4'>
                  <Sparkles className='h-8 w-8 animate-pulse text-primary' />
                </div>
              </div>
              <div className='space-y-1'>
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
            className={cn(
              'gap-2 hover:bg-accent/50 border border-transparent hover:border-border transition-all',
              fullWidth && 'w-full justify-start',
            )}
            aria-label='Generar tarjeta con IA'
          >
            <Sparkles className='h-4 w-4' aria-hidden='true' />
            <span className='font-medium'>Generar con IA</span>
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[550px] p-0 gap-0 overflow-hidden'>
          {/* AI-themed gradient header */}
          <div className='relative bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 pb-4'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(127,106,63,0.1),transparent_50%)]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,131,178,0.1),transparent_50%)]' />
            <DialogHeader className='relative'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25'>
                  <Wand2 className='h-5 w-5 text-primary-foreground' />
                </div>
                <div>
                  <DialogTitle className='text-lg'>
                    Generar Tarjeta con IA
                  </DialogTitle>
                  <DialogDescription className='text-sm'>
                    Describe tu tarea y la IA creará la tarjeta por ti
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='px-6 py-5'>
            <div className='space-y-5'>
              {/* Prompt Textarea */}
              <div className='space-y-2'>
                <Label htmlFor={promptId} className='flex items-center gap-2'>
                  <Lightbulb className='h-4 w-4 text-muted-foreground' />
                  ¿Qué tarea quieres crear?
                </Label>
                <Textarea
                  id={promptId}
                  placeholder='Describe la tarea con el mayor detalle posible. Por ejemplo: "Crear una tarea para revisar el código del proyecto frontend, debe completarse antes del viernes y es de alta prioridad"'
                  {...register('prompt')}
                  disabled={isPending}
                  aria-invalid={!!errors.prompt}
                  aria-describedby={
                    errors.prompt ? `${promptId}-error` : `${promptId}-hint`
                  }
                  className='min-h-[100px] resize-none'
                  rows={4}
                />
                {errors.prompt ? (
                  <p
                    id={`${promptId}-error`}
                    className='text-sm text-destructive'
                    role='alert'
                  >
                    {errors.prompt.message}
                  </p>
                ) : (
                  <p
                    id={`${promptId}-hint`}
                    className='text-xs text-muted-foreground'
                  >
                    Incluye detalles como título, descripción, fecha de
                    vencimiento o prioridad
                  </p>
                )}
              </div>

              {/* Example prompts */}
              <div className='space-y-2'>
                <p className='text-xs font-medium text-muted-foreground'>
                  Ejemplos de tareas:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {EXAMPLE_PROMPTS.map((example) => (
                    <button
                      key={example}
                      type='button'
                      onClick={() => handleExampleClick(example)}
                      className='rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-foreground'
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Selection */}
              <div className='space-y-2'>
                <Label htmlFor={listId} className='flex items-center gap-2'>
                  <ListTodo className='h-4 w-4 text-muted-foreground' />
                  Lista de destino
                </Label>
                <Select
                  value={currentListId}
                  onValueChange={(value) => setValue('listId', value)}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={listId}
                    className='w-full'
                    aria-invalid={!!errors.listId}
                    aria-describedby={
                      errors.listId ? `${listId}-error` : undefined
                    }
                  >
                    <SelectValue placeholder='Selecciona una lista' />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>

            <DialogFooter className='mt-6 gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setOpen(false)
                  reset()
                }}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isPending}
                className='gap-2 bg-linear-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40'
              >
                {isPending ? (
                  <>
                    <Spinner className='h-4 w-4' aria-hidden='true' />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' aria-hidden='true' />
                    Generar tarjeta
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
