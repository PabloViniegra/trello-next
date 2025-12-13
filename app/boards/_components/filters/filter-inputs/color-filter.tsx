'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BOARD_COLORS } from '@/lib/board/types'

type TColorFilterProps = {
  value: string
  onChange: (value: string) => void
}

export function ColorFilter({ value, onChange }: TColorFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-8 w-48'>
        <SelectValue placeholder='Seleccionar color' />
      </SelectTrigger>
      <SelectContent>
        {BOARD_COLORS.map((color) => (
          <SelectItem key={color.value} value={color.value}>
            <div className='flex items-center gap-2'>
              <div
                className='h-4 w-4 rounded-full border'
                style={{ backgroundColor: color.value }}
              />
              <span>{color.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
