import { create } from 'zustand'

type TBoardState = {
  activeCard: string | null
  setActiveCard: (id: string | null) => void
  isCardModalOpen: boolean
  openCardModal: () => void
  closeCardModal: () => void
}

export const useBoardStore = create<TBoardState>((set) => ({
  activeCard: null,
  setActiveCard: (id: string | null) => set({ activeCard: id }),

  isCardModalOpen: false,
  openCardModal: () => set({ isCardModalOpen: true }),
  closeCardModal: () => set({ isCardModalOpen: false }),
}))
