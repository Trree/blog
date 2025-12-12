import { create } from 'zustand'

interface BottomSheetStore {
  isTagSheetOpen: boolean
  openTagSheet: () => void
  closeTagSheet: () => void
}

export const useBottomSheetStore = create<BottomSheetStore>((set) => ({
  isTagSheetOpen: false,
  openTagSheet: () => set({ isTagSheetOpen: true }),
  closeTagSheet: () => set({ isTagSheetOpen: false }),
}))
