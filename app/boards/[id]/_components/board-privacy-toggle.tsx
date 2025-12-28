'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Unlock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
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
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { updateBoardPrivacy } from '@/lib/board/actions'
import { updateBoardPrivacySchema } from '@/lib/board/schemas'
import type { TBoardPrivacy } from '@/lib/board/types'
import { cn } from '@/lib/utils'

type TFormInput = z.infer<typeof updateBoardPrivacySchema>

type TBoardPrivacyToggleProps = {
  boardId: string
  currentPrivacy: TBoardPrivacy
  isOwner: boolean
}

export function BoardPrivacyToggle({
  boardId,
  currentPrivacy,
  isOwner,
}: TBoardPrivacyToggleProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { handleSubmit, watch, setValue, reset } = useForm<TFormInput>({
    resolver: zodResolver(updateBoardPrivacySchema),
    defaultValues: {
      boardId,
      isPrivate: currentPrivacy,
    },
  })

  const privacy = watch('isPrivate')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        boardId,
        isPrivate: currentPrivacy,
      })
    }
  }, [open, boardId, currentPrivacy, reset])

  const onSubmit = (data: TFormInput) => {
    startTransition(async () => {
      const result = await updateBoardPrivacy(data)

      if (result.success) {
        toast.success(
          data.isPrivate === 'private'
            ? 'Tablero configurado como privado'
            : 'Tablero configurado como público',
        )
        setOpen(false)
        router.refresh()
      } else {
        toast.error(
          result.error ?? 'Error al cambiar la privacidad del tablero',
        )
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
          {currentPrivacy === 'private' ? (
            <Lock className='h-4 w-4' />
          ) : (
            <Unlock className='h-4 w-4' />
          )}
          <span className='font-medium'>Privacidad</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Privacidad del tablero</DialogTitle>
          <DialogDescription>
            Configura quién puede ver este tablero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            <div className='space-y-4'>
              <Label>Nivel de acceso</Label>
              <div className='flex flex-col gap-3'>
                <Toggle
                  pressed={privacy === 'public'}
                  onPressedChange={() => setValue('isPrivate', 'public')}
                  disabled={isPending}
                  className={cn(
                    'justify-start gap-3 h-auto py-3 px-4 data-[state=on]:bg-primary/10 data-[state=on]:border-primary',
                    isPending && 'opacity-50 cursor-not-allowed',
                  )}
                  aria-label='Configurar como público'
                >
                  <Unlock className='h-4 w-4' />
                  <div className='flex flex-col items-start gap-1'>
                    <span className='font-medium'>Público</span>
                    <span className='text-xs text-muted-foreground font-normal'>
                      Cualquiera con el enlace puede ver el tablero
                    </span>
                  </div>
                </Toggle>

                <Toggle
                  pressed={privacy === 'private'}
                  onPressedChange={() => setValue('isPrivate', 'private')}
                  disabled={isPending}
                  className={cn(
                    'justify-start gap-3 h-auto py-3 px-4 data-[state=on]:bg-primary/10 data-[state=on]:border-primary',
                    isPending && 'opacity-50 cursor-not-allowed',
                  )}
                  aria-label='Configurar como privado'
                >
                  <Lock className='h-4 w-4' />
                  <div className='flex flex-col items-start gap-1'>
                    <span className='font-medium'>Privado</span>
                    <span className='text-xs text-muted-foreground font-normal'>
                      Solo los miembros invitados pueden ver el tablero
                    </span>
                  </div>
                </Toggle>
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
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
