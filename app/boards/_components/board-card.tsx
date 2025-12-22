import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Lock } from 'lucide-react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TBoard } from '@/lib/board/types'
import { cn } from '@/lib/utils'
import { DeleteBoardDialog } from './delete-board-dialog'

type TBoardCardProps = {
  board: TBoard
}

export function BoardCard({ board }: TBoardCardProps) {
  const createdAtFormatted = formatDistanceToNow(new Date(board.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className='relative h-[280px]'>
      <Link href={`/boards/${board.id}`} className='block h-full'>
        <Card
          className={cn(
            'group h-full cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col',
          )}
        >
          {/* Color header */}
          <div
            className='h-24 w-full shrink-0'
            style={{
              backgroundColor: board.backgroundColor ?? '#0079bf',
              backgroundImage: board.backgroundImage
                ? `url(${board.backgroundImage})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <CardHeader className='pb-2 shrink-0'>
            <CardTitle className='line-clamp-1 text-lg group-hover:text-primary transition-colors flex items-center gap-2'>
              {board.title}
              {board.isPrivate === 'private' && (
                <Lock className='h-4 w-4 text-muted-foreground' />
              )}
            </CardTitle>
            <CardDescription className='line-clamp-2 min-h-10'>
              {board.description || '\u00A0'}
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-0 shrink-0 mt-auto'>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Calendar className='h-3 w-3' />
              <span>Creado {createdAtFormatted}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
      <DeleteBoardDialog boardId={board.id} boardTitle={board.title} />
    </div>
  )
}
