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
import { updateUserName } from '@/lib/user/actions'
import { USER_MESSAGES } from '@/lib/user/constants'
import {
  updateUserNameSchema,
  type TUpdateUserNameInput,
} from '@/lib/user/schemas'

type TUpdateNameFormProps = {
  currentName: string
  onSuccess?: () => void
}

export function UpdateNameForm({
  currentName,
  onSuccess,
}: TUpdateNameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TUpdateUserNameInput>({
    resolver: zodResolver(updateUserNameSchema),
    defaultValues: {
      name: currentName,
    },
  })

  async function onSubmit(data: TUpdateUserNameInput) {
    setIsSubmitting(true)

    try {
      const result = await updateUserName(data)

      if (result.success) {
        toast.success(USER_MESSAGES.NAME_UPDATED)
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error al actualizar el nombre')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder='Tu nombre completo'
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Este es el nombre que se mostrará en tu perfil y actividades
              </FormDescription>
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
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  )
}
