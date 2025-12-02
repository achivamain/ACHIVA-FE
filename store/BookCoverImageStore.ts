import { create } from "zustand";

interface BookCoverImageStore {
  cache: Map<string, string>;
  getCache: (key: string) => string | undefined;
  setCache: (key: string, value: string) => void;
}
const initialCache = new Map();
export const useBookCoverImageStore = create<BookCoverImageStore>(
  (set, get) => ({
    cache: initialCache,
    getCache: (key) => get().cache.get(key),
    setCache: (key, value) => {
      set({ cache: get().cache.set(key, value) });
    },
  })
);
