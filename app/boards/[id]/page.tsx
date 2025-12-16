import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { getCurrentUser } from '@/lib/auth/get-user'
import { getBoardById } from '@/lib/board/queries'
import { getListsByBoardId } from '@/lib/list/queries'
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

  // Verify ownership
  if (board.ownerId !== user.id) {
    return (
      <CenteredMessage
        title='Access Denied'
        description='You do not have permission to view this board'
      />
    )
  }

  const lists = await getListsByBoardId(boardId)

  return <BoardDetailContent board={board} lists={lists} />
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
