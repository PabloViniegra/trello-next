'use client'

/**
 * NotificationSettingsDialog Component
 * Modal dialog for managing notification preferences
 */

import { Settings } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import {
  getPreferencesAction,
  updatePreferencesAction,
} from '@/lib/notification/actions'
import type { TUserNotificationPreferences } from '@/lib/notification/types'
import { NOTIFICATION_TYPES } from '@/lib/notification/types'

// Notification type descriptions in Spanish
const NOTIFICATION_DESCRIPTIONS: Record<
  string,
  { label: string; description: string; category: string }
> = {
  'card.assigned': {
    label: 'Tarjetas asignadas',
    description: 'Cuando te asignan una tarjeta',
    category: 'Tarjetas',
  },
  'card.due_soon': {
    label: 'Tarjetas próximas a vencer',
    description: 'Notificación 24 horas antes de la fecha límite',
    category: 'Tarjetas',
  },
  'card.overdue': {
    label: 'Tarjetas vencidas',
    description: 'Cuando una tarjeta pasa su fecha límite',
    category: 'Tarjetas',
  },
  'member.added': {
    label: 'Agregado a tablero',
    description: 'Cuando te agregan como colaborador a un tablero',
    category: 'Tableros',
  },
  'board.shared': {
    label: 'Tablero compartido',
    description: 'Cuando alguien comparte un tablero contigo',
    category: 'Tableros',
  },
  'card.moved': {
    label: 'Tarjeta movida',
    description: 'Cuando se mueve una tarjeta que estás observando',
    category: 'Actividad',
  },
  'label.assigned': {
    label: 'Etiqueta asignada',
    description: 'Cuando se asigna una etiqueta a una tarjeta',
    category: 'Actividad',
  },
}

interface NotificationSettingsDialogProps {
  trigger?: React.ReactNode
}

export function NotificationSettingsDialog({
  trigger,
}: NotificationSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [initialPreferences, setInitialPreferences] =
    useState<TUserNotificationPreferences | null>(null)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})

  const notificationTypes = Object.values(NOTIFICATION_TYPES)

  // Load preferences when dialog opens
  const loadPreferences = useCallback(async () => {
    setIsLoading(true)
    const result = await getPreferencesAction()

    if (result.success && result.preferences) {
      setInitialPreferences(result.preferences)
      setPreferences({
        'card.assigned': result.preferences.notifyCardAssigned === 1,
        'card.due_soon': result.preferences.notifyCardDue === 1,
        'card.overdue': result.preferences.notifyCardDue === 1,
        'member.added': result.preferences.notifyBoardUpdates === 1,
        'board.shared': result.preferences.notifyBoardUpdates === 1,
        'card.moved': false,
        'label.assigned': false,
      })
    } else {
      toast.error(result.error || 'Error al cargar preferencias')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (open && !initialPreferences) {
      loadPreferences()
    }
  }, [open, initialPreferences, loadPreferences])

  // Toggle preference
  const togglePreference = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true)

    const result = await updatePreferencesAction({
      notifyCardAssigned: preferences['card.assigned'],
      notifyCardDue: preferences['card.due_soon'],
      notifyBoardUpdates:
        preferences['member.added'] || preferences['board.shared'],
    })

    if (result.success) {
      toast.success('Preferencias guardadas')
      setOpen(false)
    } else {
      toast.error(result.error || 'Error al guardar preferencias')
    }

    setIsSaving(false)
  }

  // Reset to defaults
  const handleReset = () => {
    setPreferences({
      'card.assigned': true,
      'card.due_soon': true,
      'card.overdue': true,
      'member.added': true,
      'board.shared': true,
      'card.moved': false,
      'label.assigned': false,
    })
    toast.info('Preferencias restablecidas (no guardado)')
  }

  // Group notifications by category
  const categories = Array.from(
    new Set(
      notificationTypes.map(
        (type) => NOTIFICATION_DESCRIPTIONS[type]?.category || 'Otros',
      ),
    ),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <Settings className='h-4 w-4' />
            <span className='sr-only'>Configuración de notificaciones</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Configuración de Notificaciones</DialogTitle>
          <DialogDescription>
            Personaliza qué notificaciones quieres recibir
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='space-y-6 py-4'>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32' />
              <div className='space-y-3'>
                <Skeleton className='h-16 w-full' />
                <Skeleton className='h-16 w-full' />
              </div>
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32' />
              <div className='space-y-3'>
                <Skeleton className='h-16 w-full' />
                <Skeleton className='h-16 w-full' />
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6 py-4'>
            {/* Notification Types by Category */}
            {categories.map((category) => (
              <div key={category} className='space-y-4'>
                <h2 className='text-base font-semibold'>{category}</h2>
                <div className='space-y-4 rounded-lg border p-4'>
                  {notificationTypes
                    .filter(
                      (type) =>
                        (NOTIFICATION_DESCRIPTIONS[type]?.category ||
                          'Otros') === category,
                    )
                    .map((type) => {
                      const desc = NOTIFICATION_DESCRIPTIONS[type]
                      if (!desc) return null

                      return (
                        <div
                          key={type}
                          className='flex items-start justify-between gap-4'
                        >
                          <div className='flex-1'>
                            <Label
                              htmlFor={type}
                              className='text-sm font-medium'
                            >
                              {desc.label}
                            </Label>
                            <p className='text-xs text-muted-foreground'>
                              {desc.description}
                            </p>
                          </div>
                          <Toggle
                            id={type}
                            pressed={preferences[type]}
                            onPressedChange={() => togglePreference(type)}
                            aria-label={`Activar/desactivar ${desc.label}`}
                          >
                            {preferences[type] ? 'Activado' : 'Desactivado'}
                          </Toggle>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className='flex items-center justify-between border-t pt-4'>
              <Button
                variant='outline'
                onClick={handleReset}
                disabled={isSaving}
              >
                Restablecer valores
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
