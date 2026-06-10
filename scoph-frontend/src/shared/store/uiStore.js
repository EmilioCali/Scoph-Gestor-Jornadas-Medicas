import { create } from "zustand";
import toast from "react-hot-toast";

export const useUIStore = create((set) => ({
  isGlobalLoading: false,
  globalError: null,

  setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),
  setGlobalError: (error) => set({ globalError: error }),
  clearGlobalError: () => set({ globalError: null }),

  showSuccess: (message) => {
    toast.success(message);
  },

  showError: (message) => {
    toast.error(message);
  },

  showWarning: (message) => {
    toast(message, { icon: "⚠️" });
  },
}));
