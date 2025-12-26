'use client'

import { UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@/components/ui/base-autocomplete'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  addBoardMember,
  getAvailableUsers,
  getBoardMembers,
  removeBoardMember,
} from '@/lib/board-member/actions'

type TUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

type TUserItem = {
  id: string
  value: string
  userData: TUser
}

type TAddBoardMemberDialogProps = {
  boardId: string
  ownerId: string
  currentUserId: string
}

/**
 * Dialog para añadir y gestionar colaboradores de un tablero.
 * Solo visible para el propietario del tablero.
 */
export function AddBoardMemberDialog({
  boardId,
  ownerId,
  currentUserId,
}: TAddBoardMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([])
  const [currentMembers, setCurrentMembers] = useState<TUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Solo el propietario puede ver este componente
  const isOwner = currentUserId === ownerId

  const loadData = useCallback(async () => {
    setIsLoadingUsers(true)
    setIsLoadingMembers(true)

    // Cargar usuarios disponibles
    const usersResult = await getAvailableUsers(boardId)
    if (usersResult.success && usersResult.data) {
      setAvailableUsers(usersResult.data)
    } else {
      toast.error(usersResult.error ?? 'Error al cargar usuarios')
    }
    setIsLoadingUsers(false)

    // Cargar miembros actuales
    const membersResult = await getBoardMembers(boardId)
    if (membersResult.success && membersResult.data) {
      setCurrentMembers(membersResult.data)
    } else {
      toast.error(membersResult.error ?? 'Error al cargar miembros')
    }
    setIsLoadingMembers(false)
  }, [boardId])

  // Cargar usuarios disponibles y miembros actuales cuando se abre el dialog
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  // Transform users for Autocomplete component
  const userItems: TUserItem[] = availableUsers.map((userItem) => ({
    id: userItem.id,
    value: `${userItem.name} (${userItem.email})`,
    userData: userItem,
  }))

  // Extraer el userId desde el item seleccionado para validación del botón
  const selectedUserItem = userItems.find(
    (item) => item.value === selectedValue,
  )
  const selectedUserId = selectedUserItem?.userData.id ?? ''

  const handleAddMember = useCallback(() => {
    // Recalcular selectedUserId dentro del callback para asegurar valor actualizado
    const currentUserItem = userItems.find(
      (item) => item.value === selectedValue,
    )
    const currentUserId = currentUserItem?.userData.id ?? ''

    if (!currentUserId) {
      toast.error('Debes seleccionar un usuario')
      return
    }

    startTransition(async () => {
      const result = await addBoardMember({
        boardId,
        userId: currentUserId,
        role: 'member',
      })

      if (result.success) {
        toast.success('Colaborador añadido correctamente')
        setSelectedValue('')
        // Recargar datos
        await loadData()
      } else {
        toast.error(result.error ?? 'Error al añadir colaborador')
      }
    })
  }, [selectedValue, boardId, loadData, userItems])

  const handleRemoveMember = useCallback(
    (userId: string) => {
      startTransition(async () => {
        const result = await removeBoardMember({
          boardId,
          userId,
        })

        if (result.success) {
          toast.success('Colaborador eliminado correctamente')
          // Recargar datos
          await loadData()
        } else {
          toast.error(result.error ?? 'Error al eliminar colaborador')
        }
      })
    },
    [boardId, loadData],
  )

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
          <div className='flex items-center gap-2'>
            <UserPlus className='h-4 w-4' />
            <span className='font-medium'>Colaboradores</span>
            {currentMembers.length > 0 && (
              <Badge
                variant='secondary'
                className='ml-0.5 h-5 min-w-[20px] rounded-full px-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20'
              >
                {currentMembers.length}
              </Badge>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Gestionar Colaboradores</DialogTitle>
          <DialogDescription>
            Añade o elimina colaboradores de este tablero.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Añadir nuevo colaborador */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <UserPlus className='h-4 w-4 text-primary' />
              <h3 className='text-sm font-semibold text-foreground'>
                Añadir colaborador
              </h3>
            </div>

            <div className='flex gap-2'>
              <div className='flex-1'>
                {isLoadingUsers ? (
                  <div className='flex items-center gap-2 h-9 px-3 border border-input rounded-md'>
                    <Spinner className='h-4 w-4' />
                    <span className='text-sm text-muted-foreground'>
                      Cargando...
                    </span>
                  </div>
                ) : (
                  <Autocomplete
                    items={userItems}
                    value={selectedValue}
                    onValueChange={setSelectedValue}
                  >
                    <AutocompleteInput
                      placeholder='Buscar usuario...'
                      variant='md'
                      disabled={isPending}
                    />
                    <AutocompleteContent>
                      <AutocompleteEmpty>
                        No se encontraron usuarios disponibles.
                      </AutocompleteEmpty>
                      <AutocompleteList>
                        {(item: TUserItem) => (
                          <AutocompleteItem key={item.id} value={item.value}>
                            <div className='flex items-center gap-2'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage
                                  src={item.userData.image || undefined}
                                  alt={item.userData.name}
                                />
                                <AvatarFallback>
                                  {item.userData.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className='flex flex-col'>
                                <span className='text-sm font-medium'>
                                  {item.userData.name}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {item.userData.email}
                                </span>
                              </div>
                            </div>
                          </AutocompleteItem>
                        )}
                      </AutocompleteList>
                    </AutocompleteContent>
                  </Autocomplete>
                )}
              </div>

              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || isPending}
              >
                {isPending ? <Spinner className='h-4 w-4' /> : 'Añadir'}
              </Button>
            </div>
          </div>

          {/* Lista de colaboradores actuales */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center'>
                  <div className='h-2 w-2 rounded-full bg-primary' />
                </div>
                <h3 className='text-sm font-semibold text-foreground'>
                  Colaboradores actuales
                </h3>
              </div>
              <Badge variant='outline' className='text-xs'>
                {currentMembers.length}{' '}
                {currentMembers.length === 1 ? 'miembro' : 'miembros'}
              </Badge>
            </div>

            {isLoadingMembers ? (
              <div className='flex items-center justify-center py-8'>
                <Spinner className='h-6 w-6' />
              </div>
            ) : currentMembers.length === 0 ? (
              <div className='text-center py-8 space-y-2'>
                <div className='w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center'>
                  <UserPlus className='h-6 w-6 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  No hay colaboradores en este tablero
                </p>
                <p className='text-xs text-muted-foreground'>
                  Añade colaboradores para trabajar juntos
                </p>
              </div>
            ) : (
              <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
                {currentMembers.map((member) => {
                  const isOwnerMember = member.id === ownerId
                  return (
                    <div
                      key={member.id}
                      className='group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <Avatar className='h-9 w-9 ring-2 ring-background'>
                            <AvatarImage
                              src={member.image || undefined}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isOwnerMember && (
                            <div
                              className='absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary border-2 border-background flex items-center justify-center'
                              title='Propietario del tablero'
                            >
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill='currentColor'
                                className='h-2.5 w-2.5 text-primary-foreground'
                                aria-hidden='true'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className='flex flex-col'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-semibold text-foreground'>
                              {member.name}
                            </p>
                            {isOwnerMember && (
                              <Badge
                                variant='secondary'
                                className='text-xs px-1.5 py-0'
                              >
                                Propietario
                              </Badge>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {!isOwnerMember && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isPending}
                            className='opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground'
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
