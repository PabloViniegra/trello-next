import { Skeleton } from '@/components/ui/skeleton'

export function BoardDetailSkeleton() {
  return (
    <div className='h-full flex flex-col bg-background'>
      {/* Board Header Skeleton */}
      <div className='border-b-4 border-muted px-6 py-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='w-1 h-8 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>
      </div>

      {/* Lists Container Skeleton */}
      <div className='flex-1 flex gap-4 overflow-x-auto p-6'>
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
          <div key={i} className='shrink-0 w-80'>
            <div className='rounded-lg border bg-muted/50 h-full flex flex-col'>
              <div className='border-b-2 border-muted p-4'>
                <Skeleton className='h-6 w-32' />
              </div>
              <div className='p-4 space-y-2 flex-1'>
                {Array.from({ length: 3 }).map((_, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
                  <div key={j} className='rounded-md border bg-background p-3'>
                    <Skeleton className='h-4 w-full mb-2' />
                    <Skeleton className='h-3 w-3/4' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
