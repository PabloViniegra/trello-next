import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
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

type TBoardCardProps = {
  board: TBoard
}

export function BoardCard({ board }: TBoardCardProps) {
  const createdAtFormatted = formatDistanceToNow(new Date(board.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <Link href={`/boards/${board.id}`} className='block'>
      <Card
        className={cn(
          'group h-full cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5',
        )}
      >
        {/* Color header */}
        <div
          className='h-24 w-full'
          style={{
            backgroundColor: board.backgroundColor ?? '#0079bf',
            backgroundImage: board.backgroundImage
              ? `url(${board.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <CardHeader className='pb-2'>
          <CardTitle className='line-clamp-1 text-lg group-hover:text-primary transition-colors'>
            {board.title}
          </CardTitle>
          {board.description && (
            <CardDescription className='line-clamp-2'>
              {board.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Calendar className='h-3 w-3' />
            <span>Creado {createdAtFormatted}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
