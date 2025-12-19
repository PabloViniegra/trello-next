import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
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
        title='Error loading board'
        description={error ?? 'Unknown error'}
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

  return (
    <BoardDetailContent
      board={board}
      lists={lists}
      labels={labels}
      currentUserId={user.id}
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
