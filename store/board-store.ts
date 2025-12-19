import { create } from 'zustand'

/**
 * Board UI state management store.
 *
 * Manages client-side UI state for board interactions:
 * - Active card selection for detail modal
 * - Card detail modal open/close state
 *
 * @example
 * ```tsx
 * const { setActiveCard, openCardModal } = useBoardStore()
 *
 * const handleCardClick = () => {
 *   setActiveCard(cardId)
 *   openCardModal()
 * }
 * ```
 */
type TBoardState = {
  /** ID of the currently active card (shown in detail modal) */
  activeCard: string | null
  /** Set the active card ID */
  setActiveCard: (id: string | null) => void
  /** Whether the card detail modal is open */
  isCardModalOpen: boolean
  /** Open the card detail modal */
  openCardModal: () => void
  /** Close the card detail modal */
  closeCardModal: () => void
}

export const useBoardStore = create<TBoardState>((set) => ({
  activeCard: null,
  setActiveCard: (id: string | null) => set({ activeCard: id }),

  isCardModalOpen: false,
  openCardModal: () => set({ isCardModalOpen: true }),
  closeCardModal: () => set({ isCardModalOpen: false }),
}))
