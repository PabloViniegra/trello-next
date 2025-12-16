'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { TCard } from '@/lib/card/types'

type TCardItemProps = {
  card: TCard
}

export function CardItem({ card }: TCardItemProps) {
  const handleClick = () => {
    // TODO: Open card detail modal
    console.log('Card clicked:', card.id)
  }

  return (
    <button
      type='button'
      className='w-full text-left cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg'
      onClick={handleClick}
      aria-label={`Card: ${card.title}`}
    >
      <Card>
        <CardContent className='p-3'>
          <p className='text-sm font-medium font-sans'>{card.title}</p>
          {card.description && (
            <p className='text-xs text-muted-foreground mt-1 line-clamp-2 font-sans'>
              {card.description}
            </p>
          )}
          {card.dueDate && (
            <p className='text-xs text-muted-foreground mt-2 font-sans'>
              Due: {new Date(card.dueDate).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </button>
  )
}
