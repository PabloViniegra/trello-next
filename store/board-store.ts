import { create } from 'zustand'

export const useBoardStore = create((set) => ({
  activeCard: null,
  setActiveCard: (id: string | null) => set({ activeCard: id }),

  isCardModalOpen: false,
  openCardModal: () => set({ isCardModalOpen: true }),
  closeCardModal: () => set({ isCardModalOpen: false }),
}))
