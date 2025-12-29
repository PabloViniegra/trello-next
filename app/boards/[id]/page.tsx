import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { getRecentActivity } from '@/lib/activity/queries'
import { getCurrentUser } from '@/lib/auth/get-user'
import { getBoardById } from '@/lib/board/queries'
import { hasUserBoardAccess } from '@/lib/board-member/queries'
import { getLabelsWithCardCount } from '@/lib/label/queries'
import { getListsWithCardsAndLabelsByBoardId } from '@/lib/list/queries'
import { BoardDetailContent } from './_components/board-detail-content'
import { BoardDetailSkeleton } from './_components/board-detail-skeleton'

type TBoardDetailPageProps = {
  params: Promise<{ id: string }>
}

/**
 * Generate dynamic metadata for board detail page
 * SEO: Each board gets unique title and description
 */
export async function generateMetadata({
  params,
}: TBoardDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const { success, data: board } = await getBoardById(id)

  if (!success || !board) {
    return {
      title: 'Tablero no encontrado',
      description: 'El tablero solicitado no existe o no tienes permiso para acceder a él.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: board.title,
    description: board.description || `Tablero de trabajo: ${board.title}. Gestiona tus listas y tarjetas de manera eficiente.`,
    openGraph: {
      title: `${board.title} | Trello Clone`,
      description: board.description || `Tablero de trabajo: ${board.title}`,
      type: 'website',
    },
    robots: {
      index: false, // Private content - no indexar tableros privados
      follow: false,
    },
  }
}

function CenteredMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold text-destructive mb-2'>
          {title}
        </h2>
        <p className='text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

async function BoardDetailData({ boardId }: { boardId: string }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { success, data: board, error } = await getBoardById(boardId)

  if (!success || !board) {
    return (
      <CenteredMessage
        title='Error al cargar el tablero'
        description={error ?? 'Error desconocido'}
      />
    )
  }

  // Verify access (owner or member)
  const hasAccess = await hasUserBoardAccess(boardId, user.id)

  if (!hasAccess) {
    return (
      <CenteredMessage
        title='Acceso Denegado'
        description='No tienes permiso para ver este tablero'
      />
    )
  }

  const lists = await getListsWithCardsAndLabelsByBoardId(boardId)
  const labels = await getLabelsWithCardCount(boardId)
  const recentActivities = await getRecentActivity(boardId, user.id, 10)

  return (
    <BoardDetailContent
      board={board}
      lists={lists}
      labels={labels}
      currentUserId={user.id}
      initialActivities={recentActivities}
    />
  )
}

export default async function BoardDetailPage({
  params,
}: TBoardDetailPageProps) {
  const { id } = await params

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='h-[calc(100vh-4rem)]'>
        <Suspense fallback={<BoardDetailSkeleton />}>
          <BoardDetailData boardId={id} />
        </Suspense>
      </main>
    </div>
  )
}
