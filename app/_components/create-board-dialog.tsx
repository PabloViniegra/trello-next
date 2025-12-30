'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
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
import { createBoard } from '@/lib/board/actions'
import { createBoardSchema } from '@/lib/board/schemas'
import { BOARD_COLORS, DEFAULT_BOARD_COLOR } from '@/lib/board/types'
import { cn } from '@/lib/utils'

// Use z.input for RHF (before transform) instead of z.infer (after transform)
type TFormInput = z.input<typeof createBoardSchema>

type TCreateBoardDialogProps = {
  open?: boolean
  onOpenChangeAction?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateBoardDialog({
  open: controlledOpen,
  onOpenChangeAction: controlledOnOpenChange,
  trigger,
}: TCreateBoardDialogProps = {}) {
  const router = useRouter()
  const titleId = useId()
  const descriptionId = useId()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? setInternalOpen)
    : setInternalOpen

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TFormInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: '',
      description: null,
      backgroundColor: DEFAULT_BOARD_COLOR,
    },
  })

  const title = watch('title')
  const backgroundColor = watch('backgroundColor')

  const onSubmit = async (data: TFormInput) => {
    startTransition(async () => {
      const result = await createBoard(data)

      if (result.success && result.data) {
        toast.success('Tablero creado correctamente')
        setOpen(false)
        reset()
        router.push(`/boards/${result.data.id}`)
      } else {
        toast.error(result.error ?? 'Error al crear el tablero')
      }
    })
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && (
        <DialogTrigger asChild>
          <div>
            <HoverBorderGradient
              as='button'
              containerClassName='rounded-md'
              className='bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 flex items-center gap-2 font-mono font-semibold text-sm transition-colors'
              duration={1.5}
              clockwise={true}
            >
              <Plus className='h-4 w-4' />
              Crear tablero
            </HoverBorderGradient>
          </div>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Crear nuevo tablero</DialogTitle>
          <DialogDescription>
            Crea un tablero para organizar tus tareas y proyectos.
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

          <DialogFooter>
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
                  Creando...
                </span>
              ) : (
                'Crear tablero'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
