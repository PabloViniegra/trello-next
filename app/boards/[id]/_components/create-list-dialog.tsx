'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { createList } from '@/lib/list/actions'
import type { TCreateListInput } from '@/lib/list/schemas'
import { createListSchema } from '@/lib/list/schemas'
import { cn } from '@/lib/utils'

type TCreateListDialogProps = {
  boardId: string
}

export function CreateListDialog({ boardId }: TCreateListDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TCreateListInput>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      title: '',
      boardId,
    },
  })

  const onSubmit = async (data: TCreateListInput) => {
    const result = await createList(data)

    if (result.success) {
      toast.success('Lista creada correctamente')
      reset()
      setIsOpen(false)
    } else {
      toast.error(result.error ?? 'Error al crear la lista')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='shrink-0 w-80 h-auto min-h-[100px] border-dashed font-mono'
        >
          <Plus className='w-4 h-4 mr-2' />
          Añadir lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Lista</DialogTitle>
          <DialogDescription>
            Añade una nueva lista para organizar tus tarjetas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor={titleId}>Título de la lista</Label>
              <Input
                id={titleId}
                placeholder='Ingresa el título de la lista...'
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
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
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
                'Crear Lista'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
