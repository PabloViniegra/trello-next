/**
 * Notifications Page
 * Full list of user notifications with filtering and pagination
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth/get-user'
import {
  getAllNotifications,
  getUnreadNotifications,
} from '@/lib/notification/queries'
import { NotificationList } from './_components/notification-list'

interface PageProps {
  searchParams: Promise<{
    filter?: 'all' | 'unread' | 'read'
    page?: string
  }>
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const filter = params.filter || 'all'
  const page = Number.parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch notifications based on filter
  const notifications =
    filter === 'unread'
      ? await getUnreadNotifications(user.id, limit, offset)
      : await getAllNotifications(user.id, limit, offset)

  // Filter read notifications if needed
  const filteredNotifications =
    filter === 'read'
      ? notifications.filter((n) => n.isRead === 1)
      : notifications

  return (
    <div className='container max-w-4xl py-8'>
      {/* Header */}
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Notificaciones</h1>
          <p className='text-muted-foreground'>
            Gestiona todas tus notificaciones
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link href='/settings/notifications'>Configuración</Link>
        </Button>
      </div>

      {/* Notification List */}
      <NotificationList
        notifications={filteredNotifications}
        currentFilter={filter}
        currentPage={page}
        hasMore={filteredNotifications.length === limit}
      />
    </div>
  )
}
