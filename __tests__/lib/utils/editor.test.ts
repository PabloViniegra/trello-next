import type { SerializedEditorState } from 'lexical'
import { describe, expect, it } from 'vitest'
import {
  createEmptyEditorState,
  editorStateToPlainText,
  isValidEditorState,
  plainTextToEditorState,
} from '@/lib/utils/editor'

describe('Editor Utils', () => {
  describe('createEmptyEditorState', () => {
    it('should create a valid empty editor state', () => {
      const state = createEmptyEditorState()

      expect(state).toBeDefined()
      expect(state.root).toBeDefined()
      expect(state.root.children).toHaveLength(1)
      expect(state.root.children[0].children).toHaveLength(0)
    })

    it('should have correct structure', () => {
      const state = createEmptyEditorState()

      expect(state.root.type).toBe('root')
      expect(state.root.direction).toBe('ltr')
      expect(state.root.children[0].type).toBe('paragraph')
    })
  })

  describe('plainTextToEditorState', () => {
    it('should convert empty string to empty editor state', () => {
      const state = plainTextToEditorState('')

      expect(state.root.children).toHaveLength(1)
      expect(state.root.children[0].children).toHaveLength(0)
    })

    it('should convert single line to paragraph', () => {
      const text = 'Hello World'
      const state = plainTextToEditorState(text)

      expect(state.root.children).toHaveLength(1)
      expect(state.root.children[0].children[0].text).toBe(text)
    })

    it('should convert multiple lines to multiple paragraphs', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const state = plainTextToEditorState(text)

      expect(state.root.children).toHaveLength(3)
      expect(state.root.children[0].children[0].text).toBe('Line 1')
      expect(state.root.children[1].children[0].text).toBe('Line 2')
      expect(state.root.children[2].children[0].text).toBe('Line 3')
    })

    it('should handle text with only whitespace', () => {
      const text = '   '
      const state = plainTextToEditorState(text)

      expect(state.root.children).toHaveLength(1)
      expect(state.root.children[0].children).toHaveLength(1)
      expect(state.root.children[0].children[0].text).toBe(text)
    })
  })

  describe('editorStateToPlainText', () => {
    it('should convert empty editor state to empty string', () => {
      const state = createEmptyEditorState()
      const text = editorStateToPlainText(state)

      expect(text).toBe('')
    })

    it('should convert single paragraph to single line', () => {
      const state = plainTextToEditorState('Hello World')
      const text = editorStateToPlainText(state)

      expect(text).toBe('Hello World')
    })

    it('should convert multiple paragraphs to multiple lines', () => {
      const state = plainTextToEditorState('Line 1\nLine 2\nLine 3')
      const text = editorStateToPlainText(state)

      expect(text).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should handle invalid editor state', () => {
      const invalidState = {} as SerializedEditorState
      const text = editorStateToPlainText(invalidState)

      expect(text).toBe('')
    })

    it('should handle editor state without root', () => {
      const invalidState = { root: null } as unknown as SerializedEditorState
      const text = editorStateToPlainText(invalidState)

      expect(text).toBe('')
    })
  })

  describe('isValidEditorState', () => {
    it('should return true for valid editor state', () => {
      const state = createEmptyEditorState()

      expect(isValidEditorState(state)).toBe(true)
    })

    it('should return true for plaintext converted state', () => {
      const state = plainTextToEditorState('Test')

      expect(isValidEditorState(state)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidEditorState(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidEditorState(undefined)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isValidEditorState('not an editor state')).toBe(false)
    })

    it('should return false for number', () => {
      expect(isValidEditorState(123)).toBe(false)
    })

    it('should return false for object without root', () => {
      expect(isValidEditorState({ something: 'else' })).toBe(false)
    })

    it('should return false for object with invalid root', () => {
      expect(isValidEditorState({ root: 'not an object' })).toBe(false)
    })

    it('should return false for object with root without children', () => {
      expect(isValidEditorState({ root: { type: 'root' } })).toBe(false)
    })
  })

  describe('Integration: round-trip conversion', () => {
    it('should preserve text through round-trip conversion', () => {
      const originalText = 'Hello World\nThis is a test\nWith multiple lines'
      const state = plainTextToEditorState(originalText)
      const convertedText = editorStateToPlainText(state)

      expect(convertedText).toBe(originalText)
    })

    it('should preserve empty lines', () => {
      const originalText = 'Line 1\n\nLine 3'
      const state = plainTextToEditorState(originalText)
      const convertedText = editorStateToPlainText(state)

      expect(convertedText).toBe(originalText)
    })
  })
})
