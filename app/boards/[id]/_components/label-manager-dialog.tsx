'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLabel, deleteLabel, updateLabel } from '@/lib/label/actions'
import { LABEL_COLORS } from '@/lib/label/constants'
import type { TLabelWithCardCount } from '@/lib/label/types'
import { cn } from '@/lib/utils'

const labelFormSchema = z.object({
  name: z
    .string()
    .max(100, 'El nombre debe tener menos de 100 caracteres')
    .optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Selecciona un color válido'),
})

type TLabelFormData = z.infer<typeof labelFormSchema>

type TLabelManagerDialogProps = {
  boardId: string
  labels: TLabelWithCardCount[]
  isOwner: boolean
}

export function LabelManagerDialog({
  boardId,
  labels,
  isOwner,
}: TLabelManagerDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingLabel, setEditingLabel] = useState<TLabelWithCardCount | null>(
    null,
  )
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null)
  const nameId = useId()
  const editNameId = useId()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TLabelFormData>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: '',
      color: LABEL_COLORS[0].value,
    },
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    watch: watchEdit,
    setValue: setValueEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<TLabelFormData>({
    resolver: zodResolver(labelFormSchema),
  })

  const selectedColor = watch('color')
  const selectedEditColor = watchEdit('color')

  const handleCreate = useCallback(
    async (data: TLabelFormData) => {
      const result = await createLabel({
        boardId,
        name: data.name || undefined,
        color: data.color,
      })

      if (result.success) {
        toast.success('Etiqueta creada correctamente')
        reset()
        setIsCreating(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al crear la etiqueta')
      }
    },
    [boardId, reset, router],
  )

  const handleEdit = useCallback(
    async (data: TLabelFormData) => {
      if (!editingLabel) return

      const result = await updateLabel({
        id: editingLabel.id,
        name: data.name || undefined,
        color: data.color,
      })

      if (result.success) {
        toast.success('Etiqueta actualizada correctamente')
        setEditingLabel(null)
        resetEdit()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar la etiqueta')
      }
    },
    [editingLabel, resetEdit, router],
  )

  const handleDelete = useCallback(
    async (labelId: string) => {
      const label = labels.find((l) => l.id === labelId)
      if (!label) return

      const confirmed =
        label.cardCount === 0 ||
        window.confirm(
          `Esta etiqueta está asignada a ${label.cardCount} tarjeta${label.cardCount > 1 ? 's' : ''}. ¿Estás seguro de que quieres eliminarla?`,
        )

      if (!confirmed) return

      setDeletingLabel(labelId)

      const result = await deleteLabel({ id: labelId })

      if (result.success) {
        toast.success('Etiqueta eliminada correctamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar la etiqueta')
      }

      setDeletingLabel(null)
    },
    [labels, router],
  )

  const startEditing = useCallback(
    (label: TLabelWithCardCount) => {
      setEditingLabel(label)
      resetEdit({
        name: label.name || '',
        color: label.color,
      })
    },
    [resetEdit],
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
          <Tag className='h-4 w-4' />
          <span className='font-medium'>Gestionar etiquetas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Gestionar etiquetas</DialogTitle>
          <DialogDescription>
            Crea, edita o elimina etiquetas para organizar las tarjetas de tu
            tablero.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Create new label */}
          {!isCreating ? (
            <Button
              variant='outline'
              onClick={() => setIsCreating(true)}
              className='w-full gap-2'
            >
              <Plus className='h-4 w-4' />
              Nueva etiqueta
            </Button>
          ) : (
            <form onSubmit={handleSubmit(handleCreate)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor={nameId}>Nombre (opcional)</Label>
                <Input
                  id={nameId}
                  placeholder='ej. Urgente, Bug, Feature...'
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='text-sm text-destructive'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Color</Label>
                <div className='grid grid-cols-5 gap-2'>
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type='button'
                      onClick={() => setValue('color', color.value)}
                      className={cn(
                        'h-10 rounded-md transition-all hover:scale-105',
                        selectedColor === color.value &&
                          'ring-2 ring-offset-2 ring-primary',
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setIsCreating(false)
                    reset()
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Crear etiqueta
                </Button>
              </div>
            </form>
          )}

          {/* List of labels */}
          <div className='space-y-2'>
            <h3 className='text-sm font-semibold'>Etiquetas del tablero</h3>
            {labels.length === 0 ? (
              <p className='text-sm text-muted-foreground py-4 text-center'>
                No hay etiquetas creadas
              </p>
            ) : (
              <div className='space-y-2'>
                {labels.map((label) => {
                  const isEditing = editingLabel?.id === label.id
                  const isDeleting = deletingLabel === label.id

                  if (isEditing) {
                    return (
                      <form
                        key={label.id}
                        onSubmit={handleSubmitEdit(handleEdit)}
                        className='space-y-4 p-4 border rounded-lg'
                      >
                        <div className='space-y-2'>
                          <Label htmlFor={editNameId}>Nombre (opcional)</Label>
                          <Input
                            id={editNameId}
                            placeholder='ej. Urgente, Bug, Feature...'
                            {...registerEdit('name')}
                            disabled={isSubmittingEdit}
                          />
                          {errorsEdit.name && (
                            <p className='text-sm text-destructive'>
                              {errorsEdit.name.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label>Color</Label>
                          <div className='grid grid-cols-5 gap-2'>
                            {LABEL_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type='button'
                                onClick={() =>
                                  setValueEdit('color', color.value)
                                }
                                className={cn(
                                  'h-10 rounded-md transition-all hover:scale-105',
                                  selectedEditColor === color.value &&
                                    'ring-2 ring-offset-2 ring-primary',
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div className='flex gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                              setEditingLabel(null)
                              resetEdit()
                            }}
                            disabled={isSubmittingEdit}
                          >
                            Cancelar
                          </Button>
                          <Button type='submit' disabled={isSubmittingEdit}>
                            {isSubmittingEdit && (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Guardar cambios
                          </Button>
                        </div>
                      </form>
                    )
                  }

                  return (
                    <div
                      key={label.id}
                      className='flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors'
                    >
                      <div
                        className='flex-1 h-8 px-3 rounded-md flex items-center font-medium text-white text-sm'
                        style={{ backgroundColor: label.color }}
                      >
                        <span className='truncate'>
                          {label.name || 'Sin nombre'}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground min-w-[60px] text-center'>
                        {label.cardCount}{' '}
                        {label.cardCount === 1 ? 'tarjeta' : 'tarjetas'}
                      </span>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => startEditing(label)}
                        disabled={isDeleting}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(label.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4 text-destructive' />
                        )}
                      </Button>
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
