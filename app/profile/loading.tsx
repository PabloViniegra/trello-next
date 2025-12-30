import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='container mx-auto max-w-5xl px-4 py-8'>
        <div className='space-y-6'>
          {/* Header Skeleton */}
          <div>
            <Skeleton className='h-9 w-48' />
            <Skeleton className='mt-1 h-5 w-80' />
          </div>

          {/* Profile Header Skeleton */}
          <div className='rounded-lg border bg-card p-6'>
            <div className='flex items-start gap-6'>
              <Skeleton className='h-24 w-24 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className='grid gap-4 md:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-8 w-12' />
                  <Skeleton className='mt-2 h-3 w-40' />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Cards Skeleton */}
          <div className='grid gap-4 md:grid-cols-2'>
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-5 w-48' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <Skeleton className='h-12 w-full' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
