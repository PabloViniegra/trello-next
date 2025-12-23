import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useBoardStore } from '@/store/board-store'

describe('Board Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useBoardStore.setState({
      activeCard: null,
      isCardModalOpen: false,
    })
  })

  afterEach(() => {
    // Clean up after each test
    useBoardStore.setState({
      activeCard: null,
      isCardModalOpen: false,
    })
  })

  describe('activeCard', () => {
    it('has null as initial value', () => {
      expect(useBoardStore.getState().activeCard).toBeNull()
    })

    it('sets active card', () => {
      const { setActiveCard } = useBoardStore.getState()
      setActiveCard('card-123')
      expect(useBoardStore.getState().activeCard).toBe('card-123')
    })

    it('clears active card with null', () => {
      const { setActiveCard } = useBoardStore.getState()
      setActiveCard('card-123')
      setActiveCard(null)
      expect(useBoardStore.getState().activeCard).toBeNull()
    })

    it('changes active card', () => {
      const { setActiveCard } = useBoardStore.getState()
      setActiveCard('card-123')
      setActiveCard('card-456')
      expect(useBoardStore.getState().activeCard).toBe('card-456')
    })
  })

  describe('isCardModalOpen', () => {
    it('has false as initial value', () => {
      expect(useBoardStore.getState().isCardModalOpen).toBe(false)
    })

    it('opens card modal', () => {
      const { openCardModal } = useBoardStore.getState()
      openCardModal()
      expect(useBoardStore.getState().isCardModalOpen).toBe(true)
    })

    it('closes card modal', () => {
      const { openCardModal, closeCardModal } = useBoardStore.getState()
      openCardModal()
      closeCardModal()
      expect(useBoardStore.getState().isCardModalOpen).toBe(false)
    })

    it('stays open when called multiple times', () => {
      const { openCardModal } = useBoardStore.getState()
      openCardModal()
      openCardModal()
      expect(useBoardStore.getState().isCardModalOpen).toBe(true)
    })
  })

  describe('combined usage', () => {
    it('sets active card and opens modal together', () => {
      const { setActiveCard, openCardModal } = useBoardStore.getState()
      setActiveCard('card-123')
      openCardModal()

      const state = useBoardStore.getState()
      expect(state.activeCard).toBe('card-123')
      expect(state.isCardModalOpen).toBe(true)
    })

    it('clears active card and closes modal together', () => {
      const { setActiveCard, openCardModal, closeCardModal } =
        useBoardStore.getState()

      // Set up
      setActiveCard('card-123')
      openCardModal()

      // Tear down
      setActiveCard(null)
      closeCardModal()

      const state = useBoardStore.getState()
      expect(state.activeCard).toBeNull()
      expect(state.isCardModalOpen).toBe(false)
    })
  })
})
