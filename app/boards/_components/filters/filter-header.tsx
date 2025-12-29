'use client'

import { Filter, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  BOARD_FILTER_FIELDS,
  type TActiveFilter,
  type TFilterField,
  type TFilterOperator,
} from '@/lib/board/filter-types'
import { FilterRow } from './filter-row'
import { FilterSelector } from './filter-selector'

function generateFilterId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function serializeFilters(filters: TActiveFilter[]): string {
  return JSON.stringify(
    filters.map((f) => ({
      k: f.field.key,
      o: f.operator,
      v: f.value,
    })),
  )
}

function deserializeFilters(encoded: string): TActiveFilter[] {
  try {
    const parsed = JSON.parse(encoded)
    return parsed
      .map((item: { k: string; o: TFilterOperator; v: string }) => {
        const field = BOARD_FILTER_FIELDS.find((f) => f.key === item.k)
        if (!field) return null
        return {
          id: generateFilterId(),
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

export function FilterHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const [filters, setFilters] = useState<TActiveFilter[]>(() => {
    const filtersParam = searchParams.get('filters')
    return filtersParam ? deserializeFilters(filtersParam) : []
  })

  // Sync filters to URL with debounce - called manually, not in useEffect
  const syncFiltersToUrl = useCallback(
    (newFilters: TActiveFilter[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString())

          if (newFilters.length > 0) {
            params.set('filters', serializeFilters(newFilters))
          } else {
            params.delete('filters')
          }

          // Reset to page 1 when filters change
          params.set('page', '1')

          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
      }, 300)
    },
    [pathname, router, searchParams],
  )

  const handleAddFilter = useCallback(
    (field: TFilterField) => {
      const newFilter: TActiveFilter = {
        id: generateFilterId(),
        field,
        operator: field.operators[0],
        value: '',
      }
      const newFilters = [...filters, newFilter]
      setFilters(newFilters)
      syncFiltersToUrl(newFilters)
    },
    [filters, syncFiltersToUrl],
  )

  const handleOperatorChange = useCallback(
    (filterId: string, operator: TFilterOperator) => {
      const newFilters = filters.map((f) =>
        f.id === filterId ? { ...f, operator } : f,
      )
      setFilters(newFilters)
      syncFiltersToUrl(newFilters)
    },
    [filters, syncFiltersToUrl],
  )

  const handleValueChange = useCallback(
    (filterId: string, value: string) => {
      const newFilters = filters.map((f) =>
        f.id === filterId ? { ...f, value } : f,
      )
      setFilters(newFilters)
      syncFiltersToUrl(newFilters)
    },
    [filters, syncFiltersToUrl],
  )

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      const newFilters = filters.filter((f) => f.id !== filterId)
      setFilters(newFilters)
      syncFiltersToUrl(newFilters)
    },
    [filters, syncFiltersToUrl],
  )

  const handleClearAll = useCallback(() => {
    setFilters([])
    syncFiltersToUrl([])
  }, [syncFiltersToUrl])

  return (
    <div className='space-y-3 md:space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Filtros</span>
          {isPending && (
            <span className='text-xs text-muted-foreground'>
              (aplicando...)
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <FilterSelector
            activeFilters={filters}
            onAddFilter={handleAddFilter}
          />

          {filters.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearAll}
              className='text-muted-foreground'
            >
              <X className='mr-1 h-4 w-4' />
              <span className='hidden sm:inline'>Limpiar todo</span>
              <span className='sm:hidden'>Limpiar</span>
            </Button>
          )}
        </div>
      </div>

      {filters.length > 0 && (
        <div className='flex flex-col gap-2'>
          {filters.map((filter) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              onOperatorChange={handleOperatorChange}
              onValueChange={handleValueChange}
              onRemove={handleRemoveFilter}
            />
          ))}
        </div>
      )}
    </div>
  )
}
