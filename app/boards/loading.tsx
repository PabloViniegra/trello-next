import { Navbar } from '@/components/navbar'
import { Skeleton } from '@/components/ui/skeleton'

export default function BoardsLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          {/* Header skeleton */}
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-9 w-48' />
              <Skeleton className='h-5 w-72' />
            </div>
            <Skeleton className='h-10 w-32' />
          </div>

          {/* Filter section skeleton */}
          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-4 w-16' />
              </div>
              <Skeleton className='h-9 w-48' />
            </div>
          </div>

          {/* Grid skeleton */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
              <div key={i} className='rounded-xl border overflow-hidden'>
                <Skeleton className='h-24 w-full rounded-none' />
                <div className='p-6 space-y-3'>
                  <Skeleton className='h-5 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-48' />
            <div className='flex items-center gap-4'>
              <Skeleton className='h-8 w-32' />
              <div className='flex items-center gap-1'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-4 w-16 mx-2' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
