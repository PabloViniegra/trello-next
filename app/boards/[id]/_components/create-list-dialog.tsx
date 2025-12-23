'use client'

import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
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

type TCreateListDialogProps = {
  boardId: string
}

export function CreateListDialog({ boardId }: TCreateListDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const titleId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('El título de la lista es obligatorio')
      return
    }

    setIsLoading(true)

    try {
      const result = await createList({ title, boardId })

      if (result.success) {
        toast.success('Lista creada correctamente')
        setTitle('')
        setIsOpen(false)
      } else {
        toast.error(result.error ?? 'Error al crear la lista')
      }
    } catch (_error) {
      toast.error('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
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

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor={titleId}>Título de la lista</Label>
              <Input
                id={titleId}
                placeholder='Ingresa el título de la lista...'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
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
