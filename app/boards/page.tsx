import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentUser } from '@/lib/auth/get-user'
import {
  BOARD_FILTER_FIELDS,
  DEFAULT_PAGE_SIZE,
  type TActiveFilter,
  type TFilterOperator,
} from '@/lib/board/filter-types'
import { getBoardsWithFilters } from '@/lib/board/queries'
import { BoardsGrid } from './_components/boards-grid'
import { BoardsPagination } from './_components/boards-pagination'
import { FilterHeader } from './_components/filters/filter-header'

export const metadata: Metadata = {
  title: 'Mis Tableros',
  description: 'Gestiona y organiza todos tus tableros de trabajo. Visualiza, filtra y accede a tus proyectos de manera eficiente.',
  openGraph: {
    title: 'Mis Tableros | Trello Clone',
    description: 'Gestiona y organiza todos tus tableros de trabajo',
  },
  alternates: {
    canonical: '/boards',
  },
}

type TSearchParams = Promise<{
  page?: string
  pageSize?: string
  filters?: string
}>

type TBoardsPageProps = {
  searchParams: TSearchParams
}

function parseFilters(filtersParam: string | undefined): TActiveFilter[] {
  if (!filtersParam) return []

  try {
    const parsed = JSON.parse(filtersParam)
    return parsed
      .map((item: { k: string; o: TFilterOperator; v: string }) => {
        const field = BOARD_FILTER_FIELDS.find((f) => f.key === item.k)
        if (!field) return null
        return {
          id: Math.random().toString(36).substring(2, 9),
          field,
          operator: item.o,
          value: item.v,
        }
      })
      .filter(Boolean) as TActiveFilter[]
  } catch {
    return []
  }
}

async function BoardsContent({
  page,
  pageSize,
  filters,
}: {
  page: number
  pageSize: number
  filters: TActiveFilter[]
}) {
  const result = await getBoardsWithFilters({ page, pageSize, filters })

  if (!result.success || !result.data) {
    return (
      <div className='text-center py-8'>
        <p className='text-destructive'>{result.error}</p>
      </div>
    )
  }

  const { boards, totalCount, totalPages, currentPage } = result.data

  return (
    <>
      <BoardsGrid boards={boards} />

      <BoardsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </>
  )
}

function BoardsContentSkeleton() {
  return (
    <div className='space-y-6'>
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
    </div>
  )
}

export default async function BoardsPage({ searchParams }: TBoardsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const pageSize = Number.parseInt(
    params.pageSize ?? String(DEFAULT_PAGE_SIZE),
    10,
  )
  const filters = parseFilters(params.filters)

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Mis Tableros</h1>
            <p className='text-muted-foreground mt-1'>
              Gestiona y organiza todos tus tableros de trabajo
            </p>
          </div>

          {/* Filters */}
          <div className='rounded-lg border bg-card p-4'>
            <Suspense fallback={<Skeleton className='h-10 w-full' />}>
              <FilterHeader />
            </Suspense>
          </div>

          {/* Content */}
          <Suspense fallback={<BoardsContentSkeleton />}>
            <BoardsContent page={page} pageSize={pageSize} filters={filters} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
