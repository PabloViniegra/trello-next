'use client'

/**
 * NotificationSettingsForm Component
 * Form to manage user notification preferences
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { updatePreferencesAction } from '@/lib/notification/actions'
import type { TUserNotificationPreferences } from '@/lib/notification/types'

interface NotificationSettingsFormProps {
  initialPreferences: TUserNotificationPreferences
  notificationTypes: readonly string[]
}

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

export function NotificationSettingsForm({
  initialPreferences,
  notificationTypes,
}: NotificationSettingsFormProps) {
  const router = useRouter()
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    'card.assigned': initialPreferences.notifyCardAssigned === 1,
    'card.due_soon': initialPreferences.notifyCardDue === 1,
    'card.overdue': initialPreferences.notifyCardDue === 1, // Same as due_soon for now
    'member.added': initialPreferences.notifyBoardUpdates === 1,
    'board.shared': initialPreferences.notifyBoardUpdates === 1,
    'card.moved': false, // Not stored yet
    'label.assigned': false, // Not stored yet
  })
  const [isSaving, setIsSaving] = useState(false)

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
      router.refresh()
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
    <div className='space-y-8'>
      {/* Notification Types by Category */}
      {categories.map((category) => (
        <div key={category} className='space-y-4'>
          <h2 className='text-lg font-semibold'>{category}</h2>
          <div className='space-y-4 rounded-lg border p-4'>
            {notificationTypes
              .filter(
                (type) =>
                  (NOTIFICATION_DESCRIPTIONS[type]?.category || 'Otros') ===
                  category,
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
                      <Label htmlFor={type} className='text-sm font-medium'>
                        {desc.label}
                      </Label>
                      <p className='text-sm text-muted-foreground'>
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
      <div className='flex items-center justify-between border-t pt-6'>
        <Button variant='outline' onClick={handleReset} disabled={isSaving}>
          Restablecer valores predeterminados
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}
