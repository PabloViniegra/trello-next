'use client'

import { Check, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { assignLabelToCard, removeLabelFromCard } from '@/lib/label/actions'
import type { TLabel } from '@/lib/label/types'
import { cn } from '@/lib/utils'
import { LabelBadge } from './label-badge'

type TCardLabelsSelectorProps = {
  cardId: string
  boardLabels: TLabel[]
  assignedLabels: TLabel[]
}

export function CardLabelsSelector({
  cardId,
  boardLabels,
  assignedLabels,
}: TCardLabelsSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const isAssigned = useCallback(
    (labelId: string) => {
      return assignedLabels.some((l) => l.id === labelId)
    },
    [assignedLabels],
  )

  const handleToggleLabel = useCallback(
    async (label: TLabel) => {
      setLoading(label.id)

      try {
        const assigned = isAssigned(label.id)

        if (assigned) {
          // Remove label
          const result = await removeLabelFromCard({
            cardId,
            labelId: label.id,
          })

          if (result.success) {
            toast.success('Etiqueta quitada')
            router.refresh()
          } else {
            toast.error(result.error || 'Error al quitar la etiqueta')
          }
        } else {
          // Assign label
          const result = await assignLabelToCard({
            cardId,
            labelId: label.id,
          })

          if (result.success) {
            toast.success('Etiqueta asignada')
            router.refresh()
          } else {
            toast.error(result.error || 'Error al asignar la etiqueta')
          }
        }
      } catch (error) {
        toast.error('Error inesperado')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error toggling label:', error)
        }
      } finally {
        setLoading(null)
      }
    },
    [cardId, isAssigned, router],
  )

  if (boardLabels.length === 0) {
    return (
      <div className='text-sm text-muted-foreground'>
        No hay etiquetas disponibles en este tablero
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Tag className='h-4 w-4' />
          Etiquetas
          {assignedLabels.length > 0 && (
            <span className='ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium'>
              {assignedLabels.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-4' align='start'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-sm'>Etiquetas</h3>
          </div>

          {/* Assigned labels */}
          {assignedLabels.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs text-muted-foreground font-medium'>
                Asignadas
              </p>
              <div className='flex flex-wrap gap-2'>
                {assignedLabels.map((label) => (
                  <LabelBadge
                    key={label.id}
                    label={label}
                    size='md'
                    removable
                    onRemoveAction={() => handleToggleLabel(label)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available labels */}
          <div className='space-y-2'>
            <p className='text-xs text-muted-foreground font-medium'>
              Disponibles
            </p>
            <div className='max-h-[300px] overflow-y-auto space-y-1'>
              {boardLabels.map((label) => {
                const assigned = isAssigned(label.id)
                const isLoading = loading === label.id

                return (
                  <button
                    key={label.id}
                    type='button'
                    onClick={() => handleToggleLabel(label)}
                    disabled={isLoading}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-left',
                      isLoading && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div
                      className='flex-1 flex items-center gap-2 min-w-0 h-8 px-3 rounded-md font-medium text-white text-sm'
                      style={{ backgroundColor: label.color }}
                    >
                      <span className='truncate'>
                        {label.name || 'Sin nombre'}
                      </span>
                    </div>
                    {assigned && (
                      <Check className='h-4 w-4 text-primary shrink-0' />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
