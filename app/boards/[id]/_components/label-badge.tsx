'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TLabel } from '@/lib/label/types'
import { cn } from '@/lib/utils'

type TLabelBadgeProps = {
  label: TLabel
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemoveAction?: () => void
  className?: string
}

export function LabelBadge({
  label,
  size = 'md',
  removable = false,
  onRemoveAction,
  className,
}: TLabelBadgeProps) {
  const sizeClasses = {
    sm: 'h-5 px-2 text-xs min-w-[40px]',
    md: 'h-6 px-2.5 text-xs min-w-[50px]',
    lg: 'h-8 px-3 text-sm min-w-[60px]',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium text-white',
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: label.color,
      }}
      title={label.name || 'Etiqueta sin nombre'}
    >
      <span className='truncate flex-1'>{label.name || ''}</span>
      {removable && onRemoveAction && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-4 w-4 rounded-sm hover:bg-white/20 p-0 shrink-0'
          onClick={(e) => {
            e.stopPropagation()
            onRemoveAction()
          }}
        >
          <X className='h-3 w-3' />
        </Button>
      )}
    </div>
  )
}
