'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
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
import { Spinner } from '@/components/ui/spinner'
import { deleteBoard } from '@/lib/board/actions'
import type { TBoard } from '@/lib/board/types'

type TDeleteBoardButtonProps = {
  board: TBoard
  isOwner: boolean
}

/**
 * Delete board button component.
 * Only visible to board owners.
 * Shows a confirmation dialog before deleting the board.
 * Redirects to /boards after successful deletion.
 */
export function DeleteBoardButton({ board, isOwner }: TDeleteBoardButtonProps) {
  const router = useRouter()
  const descriptionId = useId()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(isOpen: boolean) {
    if (!isPending) {
      setOpen(isOpen)
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBoard({ boardId: board.id })

      if (result.success) {
        toast.success('Tablero eliminado correctamente')
        setOpen(false)
        router.push('/boards')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al eliminar el tablero')
      }
    })
  }

  // Don't render if not owner
  if (!isOwner) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='gap-2 hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all'
        >
          <Trash2 className='h-4 w-4' />
          <span className='font-medium'>Eliminar tablero</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>Eliminar tablero</DialogTitle>
          <DialogDescription id={descriptionId}>
            ¿Estás seguro de que deseas eliminar el tablero{' '}
            <span className='font-semibold text-foreground'>
              &quot;{board.title}&quot;
            </span>
            ? Esta acción no se puede deshacer y se eliminarán todas las listas
            y tarjetas asociadas.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
