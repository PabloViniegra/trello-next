import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TGradientTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
  animationSpeed?: number
  showBorder?: boolean
}

export function GradientText({
  children,
  className = '',
  colors = ['#ffaa40', '#9c40ff', '#ffaa40'],
  animationSpeed = 8,
  showBorder = false,
}: TGradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`,
  }

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center font-medium',
        className,
      )}
    >
      {showBorder && (
        <span
          className='absolute inset-0 pointer-events-none animate-gradient'
          style={{
            ...gradientStyle,
            backgroundSize: '300% 100%',
          }}
        >
          <span
            className='absolute inset-0 bg-background rounded-[1.25rem]'
            style={{
              width: 'calc(100% - 2px)',
              height: 'calc(100% - 2px)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </span>
      )}
      <span
        className='inline-block relative text-transparent bg-cover animate-gradient'
        style={{
          ...gradientStyle,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundSize: '300% 100%',
        }}
      >
        {children}
      </span>
    </span>
  )
}
