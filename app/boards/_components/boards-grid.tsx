import { LayoutGrid } from 'lucide-react'
import type { TBoard } from '@/lib/board/types'
import { BoardCard } from './board-card'

type TBoardsGridProps = {
  boards: TBoard[]
}

export function BoardsGrid({ boards }: TBoardsGridProps) {
  if (boards.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <LayoutGrid className='h-12 w-12 text-muted-foreground/50 mb-4' />
        <h3 className='text-lg font-medium'>No hay tableros</h3>
        <p className='text-sm text-muted-foreground mt-1'>
          Crea tu primer tablero para empezar a organizar tus tareas
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  )
}
