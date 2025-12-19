'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { updateCard } from '@/lib/card/actions'
import type { TCard } from '@/lib/card/types'
import { cn } from '@/lib/utils'
import { useBoardStore } from '@/store/board-store'

// Schema for the edit card form
const editCardSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título debe tener menos de 255 caracteres'),
  description: z
    .string()
    .max(5000, 'La descripción debe tener menos de 5000 caracteres')
    .optional(),
  dueDate: z.date().nullable().optional(),
})

type TEditCardFormData = z.infer<typeof editCardSchema>

type TCardDetailDialogProps = {
  card: TCard
}

export function CardDetailDialog({ card }: TCardDetailDialogProps) {
  const router = useRouter()
  const { isCardModalOpen, closeCardModal, activeCard } = useBoardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleId = useId()
  const descriptionId = useId()

  // Only show modal if this is the active card
  const isThisCardActive = activeCard === card.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<TEditCardFormData>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ? new Date(card.dueDate) : null,
    },
  })

  const dueDate = watch('dueDate')

  // Reset form when card changes
  useEffect(() => {
    let isMounted = true

    if (isThisCardActive && isCardModalOpen && isMounted) {
      reset({
        title: card.title,
        description: card.description ?? '',
        dueDate: card.dueDate ? new Date(card.dueDate) : null,
      })
    }

    return () => {
      isMounted = false
    }
  }, [isThisCardActive, isCardModalOpen, card, reset])

  const onSubmit = useCallback(
    async (data: TEditCardFormData) => {
      setIsSubmitting(true)

      try {
        const result = await updateCard({
          id: card.id,
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate ?? null,
        })

        if (result.success) {
          toast.success('Tarjeta actualizada correctamente')
          closeCardModal()
          router.refresh() // Refresh data from server
        } else {
          toast.error(result.error || 'Error al actualizar la tarjeta')
        }
      } catch (error) {
        toast.error('Error inesperado al actualizar la tarjeta')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating card:', error)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [card.id, closeCardModal, router],
  )

  const handleClose = useCallback(() => {
    if (isSubmitting) return

    if (isDirty) {
      const confirmed = window.confirm(
        '¿Estás seguro? Los cambios no guardados se perderán.',
      )
      if (!confirmed) return
    }

    closeCardModal()
  }, [isSubmitting, isDirty, closeCardModal])

  const handleClearDate = useCallback(() => {
    setValue('dueDate', null, { shouldDirty: true })
  }, [setValue])

  return (
    <Dialog
      open={isCardModalOpen && isThisCardActive}
      onOpenChange={handleClose}
    >
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Detalles de la tarjeta</DialogTitle>
          <DialogDescription>
            Edita la información de la tarjeta. Los cambios se guardarán al
            hacer clic en "Guardar cambios".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Title Field */}
          <div className='space-y-2'>
            <Label htmlFor={titleId}>
              Título <span className='text-destructive'>*</span>
            </Label>
            <Input
              id={titleId}
              placeholder='Título de la tarjeta'
              {...register('title')}
              disabled={isSubmitting}
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <Label htmlFor={descriptionId}>Descripción</Label>
              <span className='text-xs text-muted-foreground'>
                {watch('description')?.length || 0} / 5000
              </span>
            </div>
            <Textarea
              id={descriptionId}
              placeholder='Añade una descripción más detallada...'
              rows={5}
              {...register('description')}
              disabled={isSubmitting}
              className='resize-none'
              maxLength={5000}
            />
            {errors.description && (
              <p className='text-sm text-destructive'>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Due Date Field */}
          <div className='space-y-2'>
            <Label>Fecha de vencimiento</Label>
            <div className='flex gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground',
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={dueDate ?? undefined}
                    onSelect={(date) =>
                      setValue('dueDate', date ?? null, { shouldDirty: true })
                    }
                  />
                </PopoverContent>
              </Popover>

              {dueDate && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClearDate}
                  disabled={isSubmitting}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting || !isDirty}>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
