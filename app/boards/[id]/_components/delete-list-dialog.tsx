'use client'

import { Trash2 } from 'lucide-react'
import { useId, useTransition } from 'react'
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
import { deleteList } from '@/lib/list/actions'

type TDeleteListDialogProps = {
  listId: string
  listTitle: string
  open: boolean
  onOpenChangeAction?: (open: boolean) => void
}

export function DeleteListDialog({
  listId,
  listTitle,
  open,
  onOpenChangeAction,
}: TDeleteListDialogProps) {
  const [isPending, startTransition] = useTransition()
  const descriptionId = useId()

  const handleOpenChange = (isOpen: boolean) => {
    // Prevent closing during pending operations
    if (!isOpen && isPending) {
      return
    }
    onOpenChangeAction?.(isOpen)
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteList({ id: listId })

      if (result.success) {
        toast.success('Lista eliminada correctamente')
        handleOpenChange(false)
      } else {
        toast.error(result.error ?? 'Error al eliminar la lista')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md' aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>Eliminar lista</DialogTitle>
          <DialogDescription id={descriptionId}>
            ¿Estás seguro de que deseas eliminar la lista{' '}
            <span className='font-semibold text-foreground'>
              &quot;{listTitle}&quot;
            </span>
            ? Esta acción no se puede deshacer y se eliminarán todas las
            tarjetas asociadas.
          </DialogDescription>
        </DialogHeader>
        <div className='pt-6'>
          <DialogFooter className='gap-3 sm:gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
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
                <>
                  <Trash2 className='w-4 h-4 mr-2' />
                  Eliminar lista
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
