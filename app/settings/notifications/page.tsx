/**
 * Notification Settings Page
 * User preferences for notification types
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Configuración de Notificaciones',
  description: 'Personaliza tus preferencias de notificaciones y gestiona cómo recibes actualizaciones.',
  robots: {
    index: false,
    follow: false,
  },
}
import { getCurrentUser } from '@/lib/auth/get-user'
import { getUserPreferences } from '@/lib/notification/queries'
import { NOTIFICATION_TYPES } from '@/lib/notification/types'
import { NotificationSettingsForm } from './_components/notification-settings-form'

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Get user preferences (auto-creates defaults if they don't exist)
  const preferences = await getUserPreferences(user.id)

  return (
    <div className='container max-w-2xl py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Configuración de Notificaciones</h1>
        <p className='mt-2 text-muted-foreground'>
          Personaliza qué notificaciones quieres recibir
        </p>
      </div>

      {/* Settings Form */}
      <NotificationSettingsForm
        initialPreferences={preferences}
        notificationTypes={Object.values(NOTIFICATION_TYPES)}
      />
    </div>
  )
}
