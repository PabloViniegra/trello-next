'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import type { TCard } from '@/lib/card/types'
import { cn } from '@/lib/utils'
import { CardItem } from './card-item'

type TDraggableCardProps = {
  card: TCard
}

/**
 * A draggable card component that can be moved between lists.
 * Uses dnd-kit's sortable functionality with optimized rendering.
 */
export function DraggableCard({ card }: TDraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  // Memoize style object to prevent unnecessary re-renders
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('touch-none', isDragging && 'opacity-40 scale-105 z-50')}
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <CardItem card={card} />
    </div>
  )
}
