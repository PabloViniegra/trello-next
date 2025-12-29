'use client'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/lib/board/filter-types'

type TBoardsPaginationProps = {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
}

export function BoardsPagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
}: TBoardsPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
          params.set(key, value)
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, router, searchParams],
  )

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() })
  }

  const handlePageSizeChange = (size: string) => {
    updateSearchParams({ pageSize: size, page: '1' })
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  if (totalCount === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground'>
        <span className='hidden sm:inline'>
          Mostrando {startItem}-{endItem} de {totalCount} tableros
        </span>
        <span className='sm:hidden'>
          {startItem}-{endItem} de {totalCount}
        </span>
        {isPending && <span className='text-xs'>(cargando...)</span>}
      </div>

      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4'>
        <div className='flex items-center gap-2 justify-between sm:justify-start'>
          <span className='text-xs sm:text-sm text-muted-foreground'>
            Por página:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className='h-8 w-16 sm:w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1 justify-center'>
          {/* Primera página - oculto en móvil */}
          <Button
            variant='outline'
            size='icon'
            className='hidden sm:flex h-8 w-8'
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isPending}
          >
            <ChevronsLeft className='h-4 w-4' />
            <span className='sr-only'>Primera página</span>
          </Button>

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Página anterior</span>
          </Button>

          <div className='flex items-center gap-1 px-2 min-w-[80px] justify-center'>
            <span className='text-sm font-medium'>{currentPage}</span>
            <span className='text-sm text-muted-foreground'>de</span>
            <span className='text-sm font-medium'>{totalPages}</span>
          </div>

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
          >
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Página siguiente</span>
          </Button>

          {/* Última página - oculto en móvil */}
          <Button
            variant='outline'
            size='icon'
            className='hidden sm:flex h-8 w-8'
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isPending}
          >
            <ChevronsRight className='h-4 w-4' />
            <span className='sr-only'>Última página</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
