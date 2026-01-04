'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateUserPassword } from '@/lib/user/actions'
import { USER_MESSAGES } from '@/lib/user/constants'
import {
  updateUserPasswordSchema,
  type TUpdateUserPasswordInput,
} from '@/lib/user/schemas'

type TUpdatePasswordFormProps = {
  onSuccess?: () => void
}

export function UpdatePasswordForm({ onSuccess }: TUpdatePasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TUpdateUserPasswordInput>({
    resolver: zodResolver(updateUserPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: TUpdateUserPasswordInput) {
    setIsSubmitting(true)

    try {
      const result = await updateUserPassword(data)

      if (result.success) {
        toast.success(USER_MESSAGES.PASSWORD_UPDATED)
        form.reset()
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error al actualizar la contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Tu contraseña actual'
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Nueva contraseña'
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Debe contener al menos 8 caracteres, una mayúscula, una
                minúscula y un número
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Confirma tu nueva contraseña'
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            onClick={() => form.reset()}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Actualizar contraseña
          </Button>
        </div>
      </form>
    </Form>
  )
}
