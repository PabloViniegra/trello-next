'use client'

import { Lock, Unlock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type TPrivacyFilterProps = {
  value: string
  onChange: (value: string) => void
}

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Público', icon: Unlock },
  { value: 'private', label: 'Privado', icon: Lock },
] as const

export function PrivacyFilter({ value, onChange }: TPrivacyFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-8 w-48'>
        <SelectValue placeholder='Seleccionar privacidad' />
      </SelectTrigger>
      <SelectContent>
        {PRIVACY_OPTIONS.map((privacy) => (
          <SelectItem key={privacy.value} value={privacy.value}>
            <div className='flex items-center gap-2'>
              <privacy.icon className='h-4 w-4' />
              <span>{privacy.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
