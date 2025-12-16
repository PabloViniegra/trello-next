import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type TSpinnerProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Spinner({ className, size = 'md' }: TSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
      aria-hidden='true'
    />
  )
}
