'use client'

import { Trash2 } from 'lucide-react'
import { useCallback, useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { deleteBoard } from '@/lib/board/actions'
import { cn } from '@/lib/utils'

type TDeleteBoardDialogProps = {
  boardId: string
  boardTitle: string
}

export function DeleteBoardDialog({
  boardId,
  boardTitle,
}: TDeleteBoardDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const descriptionId = useId()

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
  }, [])

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deleteBoard({ boardId })

      if (result.success) {
        toast.success('Tablero eliminado correctamente')
        setOpen(false)
      } else {
        toast.error(result.error ?? 'Error al eliminar el tablero')
      }
    })
  }, [boardId])

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }, [])

  return (
    <>
      <button
        type='button'
        className={cn(
          'absolute top-2 right-2 z-10 p-1.5 rounded-md',
          'bg-black/50 text-white opacity-70 group-hover:opacity-100',
          'hover:bg-destructive transition-all duration-200',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2',
        )}
        onClick={handleButtonClick}
        aria-label={`Eliminar tablero "${boardTitle}". Esta acción no se puede deshacer.`}
        title={`Eliminar tablero "${boardTitle}"`}
      >
        <Trash2 className='h-4 w-4' aria-hidden='true' />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-md' aria-describedby={descriptionId}>
          <DialogHeader>
            <DialogTitle>Eliminar tablero</DialogTitle>
            <DialogDescription id={descriptionId}>
              ¿Estás seguro de que deseas eliminar el tablero{' '}
              <span className='font-semibold text-foreground'>
                &quot;{boardTitle}&quot;
              </span>
              ? Esta acción no se puede deshacer y se eliminarán todas las
              listas y tarjetas asociadas.
            </DialogDescription>
          </DialogHeader>
          <div className='pt-6'>
            <DialogFooter className='gap-3 sm:gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <span className='flex items-center gap-2'>
                    <Spinner size='sm' />
                    Eliminando...
                  </span>
                ) : (
                  'Eliminar tablero'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
