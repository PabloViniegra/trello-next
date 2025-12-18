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
import { deleteCard } from '@/lib/card/actions'
import { cn } from '@/lib/utils'

type TDeleteCardDialogProps = {
  cardId: string
  cardTitle: string
}

export function DeleteCardDialog({
  cardId,
  cardTitle,
}: TDeleteCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const descriptionId = useId()

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      // Prevent closing during pending operations
      if (!isOpen && isPending) {
        return
      }
      setOpen(isOpen)
    },
    [isPending],
  )

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deleteCard({ id: cardId })

      if (result.success) {
        toast.success('Tarjeta eliminada correctamente')
        setOpen(false)
      } else {
        toast.error(result.error ?? 'Error al eliminar la tarjeta')
      }
    })
  }, [cardId])

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
          'bg-background/80 backdrop-blur-sm border border-border/50',
          'text-muted-foreground opacity-0 group-hover:opacity-100',
          'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive',
          'transition-all duration-200',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2',
        )}
        onClick={handleButtonClick}
        aria-label={`Eliminar tarjeta "${cardTitle}". Esta acción no se puede deshacer.`}
        title={`Eliminar tarjeta "${cardTitle}"`}
      >
        <Trash2 className='h-3.5 w-3.5' aria-hidden='true' />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-md' aria-describedby={descriptionId}>
          <DialogHeader>
            <DialogTitle>Eliminar Tarjeta</DialogTitle>
            <DialogDescription id={descriptionId}>
              ¿Estás seguro de que deseas eliminar la tarjeta{' '}
              <span className='font-semibold text-foreground'>
                &quot;{cardTitle}&quot;
              </span>
              ? Esta acción no se puede deshacer.
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
                  'Eliminar tarjeta'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
