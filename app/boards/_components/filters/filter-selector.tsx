'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BOARD_FILTER_FIELDS,
  type TActiveFilter,
  type TFilterField,
} from '@/lib/board/filter-types'

type TFilterSelectorProps = {
  activeFilters: TActiveFilter[]
  onAddFilter: (field: TFilterField) => void
}

export function FilterSelector({
  activeFilters,
  onAddFilter,
}: TFilterSelectorProps) {
  const [selectKey, setSelectKey] = useState(0)

  // Filter out fields that are already active
  const availableFields = BOARD_FILTER_FIELDS.filter(
    (field) => !activeFilters.some((f) => f.field.key === field.key),
  )

  const handleSelect = (fieldKey: string) => {
    const field = BOARD_FILTER_FIELDS.find((f) => f.key === fieldKey)
    if (field) {
      onAddFilter(field)
      // Reset the select by changing its key
      setSelectKey((prev) => prev + 1)
    }
  }

  if (availableFields.length === 0) {
    return null
  }

  return (
    <div className='flex items-center gap-2'>
      <Select key={selectKey} onValueChange={handleSelect} value=''>
        <SelectTrigger className='w-48'>
          <div className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            <SelectValue placeholder='Añadir filtro' />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((field) => (
            <SelectItem key={field.key} value={field.key}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
