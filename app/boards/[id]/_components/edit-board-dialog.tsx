'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useState, useTransition } from 'react'
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
import { updateBoard } from '@/lib/board/actions'
import { updateBoardSchema } from '@/lib/board/schemas'
import type { TBoard } from '@/lib/board/types'
import { BOARD_COLORS, DEFAULT_BOARD_COLOR } from '@/lib/board/types'
import { cn } from '@/lib/utils'

type TFormInput = z.infer<typeof updateBoardSchema>

type TEditBoardDialogProps = {
  board: TBoard
  isOwner: boolean
}

export function EditBoardDialog({ board, isOwner }: TEditBoardDialogProps) {
  const router = useRouter()
  const titleId = useId()
  const descriptionId = useId()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TFormInput>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      boardId: board.id,
      title: board.title,
      description: board.description || '',
      backgroundColor: board.backgroundColor || DEFAULT_BOARD_COLOR,
    },
  })

  const title = watch('title')
  const backgroundColor = watch('backgroundColor')

  // Reset form when dialog opens or board changes
  useEffect(() => {
    if (open) {
      reset({
        boardId: board.id,
        title: board.title,
        description: board.description || '',
        backgroundColor: board.backgroundColor || DEFAULT_BOARD_COLOR,
      })
    }
  }, [open, board, reset])

  const onSubmit = (data: TFormInput) => {
    startTransition(async () => {
      const result = await updateBoard(data)

      if (result.success) {
        toast.success('Tablero actualizado correctamente')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al actualizar el tablero')
      }
    })
  }

  // Don't render if not owner
  if (!isOwner) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='gap-2 hover:bg-accent/50 border border-transparent hover:border-border transition-all'
        >
          <Pencil className='h-4 w-4' />
          <span className='font-medium'>Editar tablero</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Editar tablero</DialogTitle>
          <DialogDescription>
            Modifica el título, descripción o color de tu tablero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            {/* Vista previa del tablero */}
            <div
              className='h-24 rounded-lg flex items-center justify-center transition-colors'
              style={{
                backgroundColor: backgroundColor || DEFAULT_BOARD_COLOR,
              }}
            >
              <span className='text-white font-semibold text-lg drop-shadow-md'>
                {title || 'Mi tablero'}
              </span>
            </div>

            {/* Título */}
            <div className='space-y-2'>
              <Label htmlFor={titleId}>
                Título <span className='text-destructive'>*</span>
              </Label>
              <Input
                id={titleId}
                placeholder='Nombre del tablero'
                {...register('title')}
                disabled={isPending}
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && (
                <p className='text-sm text-destructive'>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className='space-y-2'>
              <Label htmlFor={descriptionId}>Descripción (opcional)</Label>
              <Input
                id={descriptionId}
                placeholder='Describe el propósito del tablero'
                {...register('description')}
                disabled={isPending}
                className={cn(errors.description && 'border-destructive')}
              />
              {errors.description && (
                <p className='text-sm text-destructive'>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Selector de color */}
            <div className='space-y-2'>
              <Label>Color de fondo</Label>
              <div className='flex flex-wrap gap-2'>
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    title={color.name}
                    className={cn(
                      'h-8 w-8 rounded-md transition-all hover:scale-110',
                      backgroundColor === color.value &&
                        'ring-2 ring-offset-2 ring-primary',
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setValue('backgroundColor', color.value)}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='animate-spin h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                  >
                    <title>Cargando</title>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
