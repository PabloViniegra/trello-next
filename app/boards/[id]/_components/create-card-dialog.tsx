'use client'

import { CalendarIcon, Plus } from 'lucide-react'
import { useId, useState } from 'react'
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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const titleId = useId()
  const descriptionId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('El título de la tarjeta es obligatorio')
      return
    }

    setIsLoading(true)

    try {
      const result = await createCard({
        title: title.trim(),
        description: description.trim() || undefined,
        listId,
        dueDate,
      })

      if (result.success) {
        toast.success('Tarjeta creada correctamente')
        setTitle('')
        setDescription('')
        setDueDate(undefined)
        handleOpenChange(false)
      } else {
        toast.error(result.error ?? 'Error al crear la tarjeta')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDueDate(undefined)
  }

  const handleOpenChange = (open: boolean) => {
    // Prevent closing during pending operations
    if (!open && isLoading) {
      return
    }

    if (isControlled) {
      onOpenChangeAction?.(open)
    } else {
      setInternalOpen(open)
    }
    if (!open) {
      resetForm()
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

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            {/* Título Field */}
            <div className='space-y-2'>
              <Label htmlFor={titleId}>
                Título <span className='text-destructive'>*</span>
              </Label>
              <Input
                id={titleId}
                placeholder='Ingresa el título de la tarjeta...'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
                required
              />
            </div>

            {/* Descripción Field */}
            <div className='space-y-2'>
              <Label htmlFor={descriptionId}>Descripción</Label>
              <Textarea
                id={descriptionId}
                placeholder='Añade una descripción más detallada... (opcional)'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
                className='resize-none'
              />
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
                    disabled={isLoading}
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
                    onSelect={setDueDate}
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
                        onClick={() => setDueDate(undefined)}
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading || !title.trim()}>
              {isLoading ? (
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
