import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TBoard } from '@/lib/board/types'
import type { TListWithCards } from '@/lib/list/types'
import { CardItem } from './card-item'
import { CreateCardDialog } from './create-card-dialog'
import { CreateListDialog } from './create-list-dialog'

type TBoardDetailContentProps = {
  board: TBoard
  lists: TListWithCards[]
}

export function BoardDetailContent({ board, lists }: TBoardDetailContentProps) {
  return (
    <div className='h-full flex flex-col bg-background'>
      {/* Board Header with Color Bar */}
      <div
        className='border-b-4 px-6 py-4'
        style={{
          borderColor: board.backgroundColor ?? '#0079bf',
        }}
      >
        <div className='flex items-center gap-3'>
          <div
            className='w-1 h-8 rounded-full'
            style={{
              backgroundColor: board.backgroundColor ?? '#0079bf',
            }}
          />
          <div>
            <h1 className='text-3xl font-display font-bold text-foreground tracking-tight'>
              {board.title}
            </h1>
            {board.description && (
              <p className='text-muted-foreground text-sm mt-1.5 font-sans'>
                {board.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lists Container with Horizontal Scroll */}
      <div className='flex-1 flex gap-4 overflow-x-auto p-6'>
        {lists.map((list) => (
          <div key={list.id} className='shrink-0 w-80'>
            <Card className='h-full flex flex-col bg-muted/50'>
              <CardHeader
                className='pb-3 border-b-2'
                style={{
                  borderColor: board.backgroundColor ?? '#0079bf',
                }}
              >
                <CardTitle className='text-lg font-semibold font-sans'>
                  {list.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col gap-2 overflow-y-auto'>
                {/* Cards */}
                {list.cards.length > 0 ? (
                  <div className='space-y-2'>
                    {list.cards.map((card) => (
                      <CardItem key={card.id} card={card} />
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    No cards yet
                  </p>
                )}

                {/* Add Card Button */}
                <div className='mt-auto pt-2'>
                  <CreateCardDialog listId={list.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Add List Button */}
        <CreateListDialog boardId={board.id} />
      </div>
    </div>
  )
}
