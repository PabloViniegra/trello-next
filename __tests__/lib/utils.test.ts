import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles undefined values', () => {
      const result = cn('class1', undefined, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles false values', () => {
      const result = cn('class1', false && 'class2', 'class3')
      expect(result).toBe('class1 class3')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('handles conditional false classes', () => {
      const isActive = false
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base')
    })

    it('merges Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6')
      expect(result).toBe('py-2 px-6')
    })

    it('resolves Tailwind conflicts with last value winning', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles null values', () => {
      const result = cn('class1', null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('handles object syntax', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      })
      expect(result).toBe('class1 class3')
    })

    it('handles mixed syntax', () => {
      const result = cn('base', ['array1', 'array2'], { object: true })
      expect(result).toBe('base array1 array2 object')
    })
  })
})
