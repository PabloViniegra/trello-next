'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TUser } from '@/lib/auth/types'
import { UpdateAvatarForm } from './update-avatar-form'
import { UpdateNameForm } from './update-name-form'
import { UpdatePasswordForm } from './update-password-form'

type TEditProfileDialogProps = {
  user: TUser
}

export function EditProfileDialog({ user }: TEditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    // Refresh the page to show updated data
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings className='mr-2 h-4 w-4' />
          Editar perfil
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal, avatar y contraseña
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='general' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='avatar'>Avatar</TabsTrigger>
            <TabsTrigger value='password'>Contraseña</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4'>
            <div>
              <h3 className='mb-1 text-sm font-medium'>Información personal</h3>
              <p className='text-sm text-muted-foreground'>
                Actualiza tu nombre y datos básicos
              </p>
            </div>
            <Separator />
            <UpdateNameForm
              currentName={user.name}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value='avatar' className='space-y-4'>
            <div>
              <h3 className='mb-1 text-sm font-medium'>Foto de perfil</h3>
              <p className='text-sm text-muted-foreground'>
                Sube una imagen para personalizar tu perfil
              </p>
            </div>
            <Separator />
            <UpdateAvatarForm
              currentImageUrl={user.image}
              userName={user.name}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value='password' className='space-y-4'>
            <div>
              <h3 className='mb-1 text-sm font-medium'>Cambiar contraseña</h3>
              <p className='text-sm text-muted-foreground'>
                Actualiza tu contraseña para mantener tu cuenta segura
              </p>
            </div>
            <Separator />
            <UpdatePasswordForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
