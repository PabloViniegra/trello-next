'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import type { TCard } from '@/lib/card/types'
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
  } = useSortable({ id: card.id })

  // Memoize style object to prevent unnecessary re-renders
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, transition, isDragging],
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <CardItem card={card} />
    </div>
  )
}
