'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { createCard } from '@/lib/card/actions'
import type { TCreateCardInput } from '@/lib/card/schemas'
import { createCardSchema } from '@/lib/card/schemas'
import { cn } from '@/lib/utils'

type TCreateCardDialogProps = {
  listId: string
  open?: boolean
  onOpenChangeAction?: (open: boolean) => void
}

export function CreateCardDialog({
  listId,
  open: controlledOpen,
  onOpenChangeAction,
}: TCreateCardDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const titleId = useId()
  const descriptionId = useId()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TCreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      listId,
      title: '',
      description: '',
      dueDate: undefined,
    },
  })

  const dueDate = watch('dueDate')

  const onSubmit = async (data: TCreateCardInput) => {
    const result = await createCard({
      ...data,
      description: data.description?.trim() || undefined,
    })

    if (result.success) {
      toast.success('Tarjeta creada correctamente')
      reset()
      handleOpenChange(false)
    } else {
      toast.error(result.error ?? 'Error al crear la tarjeta')
    }
  }

  const handleOpenChange = (open: boolean) => {
    // Prevent closing during pending operations
    if (!open && isSubmitting) {
      return
    }

    if (isControlled) {
      onOpenChangeAction?.(open)
    } else {
      setInternalOpen(open)
    }
    if (!open) {
      reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='w-full justify-start font-mono'
          >
            <Plus className='w-4 h-4 mr-2' />
            Añadir una tarjeta
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarjeta</DialogTitle>
          <DialogDescription>
            Añade una nueva tarjeta con descripción y fecha de vencimiento
            opcionales
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            {/* Título Field */}
            <div className='space-y-2'>
              <Label htmlFor={titleId}>
                Título <span className='text-destructive'>*</span>
              </Label>
              <Input
                id={titleId}
                placeholder='Ingresa el título de la tarjeta...'
                {...register('title')}
                disabled={isSubmitting}
                autoFocus
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && (
                <p className='text-sm text-destructive'>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descripción Field */}
            <div className='space-y-2'>
              <Label htmlFor={descriptionId}>Descripción</Label>
              <Textarea
                id={descriptionId}
                placeholder='Añade una descripción más detallada... (opcional)'
                {...register('description')}
                disabled={isSubmitting}
                rows={4}
                className='resize-none'
              />
              {errors.description && (
                <p className='text-sm text-destructive'>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Fecha de vencimiento Field */}
            <div className='space-y-2'>
              <Label>Fecha de vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground',
                    )}
                    disabled={isSubmitting}
                    type='button'
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dueDate ? (
                      dueDate.toLocaleDateString('es-ES', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    ) : (
                      <span>Elige una fecha (opcional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={dueDate}
                    onSelect={(date) => setValue('dueDate', date)}
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                  {dueDate && (
                    <div className='p-3 border-t'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full'
                        onClick={() => setValue('dueDate', undefined)}
                        type='button'
                      >
                        Limpiar fecha
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className='w-4 h-4 mr-2' />
                  Creando...
                </>
              ) : (
                'Crear Tarjeta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
