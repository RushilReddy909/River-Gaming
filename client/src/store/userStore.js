import { create } from "zustand";

const useUserStore = create((set) => ({
  userId: null,
  coins: 0,

  setUserId: (id) => set({ userId: id }),

  setCoins: (newCoins) => set({ coins: newCoins }),
  incrementCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  deductCoins: (amount) => set((state) => ({ coins: state.coins - amount })),
}));

export default useUserStore;
