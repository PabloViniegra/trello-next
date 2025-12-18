'use client'

import { Edit2, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateCardDialog } from './create-card-dialog'
import { DeleteListDialog } from './delete-list-dialog'

type TListActionsMenuProps = {
  listId: string
  listTitle: string
  onRenameAction: () => void
}

export function ListActionsMenu({
  listId,
  listTitle,
  onRenameAction,
}: TListActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleRename = useCallback(() => {
    setDropdownOpen(false)
    onRenameAction()
  }, [onRenameAction])

  const handleDelete = useCallback(() => {
    setDropdownOpen(false)
    setShowDeleteDialog(true)
  }, [])

  const handleAddCard = useCallback(() => {
    setDropdownOpen(false)
    setShowCreateCardDialog(true)
  }, [])

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            aria-label='Acciones de lista'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem onClick={handleAddCard}>
            <Plus className='mr-2 h-4 w-4' />
            Añadir tarjeta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRename}>
            <Edit2 className='mr-2 h-4 w-4' />
            Renombrar lista
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} variant='destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar lista
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteListDialog
        listId={listId}
        listTitle={listTitle}
        open={showDeleteDialog}
        onOpenChangeAction={setShowDeleteDialog}
      />

      <CreateCardDialog
        listId={listId}
        open={showCreateCardDialog}
        onOpenChangeAction={setShowCreateCardDialog}
      />
    </>
  )
}
