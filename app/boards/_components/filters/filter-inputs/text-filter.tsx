'use client'

import { Input } from '@/components/ui/input'

type TTextFilterProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextFilter({
  value,
  onChange,
  placeholder = 'Escribe para filtrar...',
}: TTextFilterProps) {
  return (
    <Input
      type='text'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='h-8 w-48'
    />
  )
}
