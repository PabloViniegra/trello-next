'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  OPERATOR_LABELS,
  type TActiveFilter,
  type TFilterOperator,
} from '@/lib/board/filter-types'
import { ColorFilter } from './filter-inputs/color-filter'
import { DateFilter } from './filter-inputs/date-filter'
import { TextFilter } from './filter-inputs/text-filter'

type TFilterRowProps = {
  filter: TActiveFilter
  onOperatorChange: (filterId: string, operator: TFilterOperator) => void
  onValueChange: (filterId: string, value: string) => void
  onRemove: (filterId: string) => void
}

export function FilterRow({
  filter,
  onOperatorChange,
  onValueChange,
  onRemove,
}: TFilterRowProps) {
  const renderValueInput = () => {
    switch (filter.field.type) {
      case 'text':
        return (
          <TextFilter
            value={filter.value}
            onChange={(value) => onValueChange(filter.id, value)}
          />
        )
      case 'date':
        return (
          <DateFilter
            value={filter.value}
            onChange={(value) => onValueChange(filter.id, value)}
          />
        )
      case 'color':
        return (
          <ColorFilter
            value={filter.value}
            onChange={(value) => onValueChange(filter.id, value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className='flex items-center gap-2 rounded-lg border bg-muted/50 p-2'>
      <Badge variant='secondary' className='shrink-0'>
        {filter.field.label}
      </Badge>

      <Select
        value={filter.operator}
        onValueChange={(value) =>
          onOperatorChange(filter.id, value as TFilterOperator)
        }
      >
        <SelectTrigger className='h-8 w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filter.field.operators.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderValueInput()}

      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 shrink-0'
        onClick={() => onRemove(filter.id)}
      >
        <X className='h-4 w-4' />
        <span className='sr-only'>Eliminar filtro</span>
      </Button>
    </div>
  )
}
