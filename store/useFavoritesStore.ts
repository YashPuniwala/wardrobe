import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteColors: string[];
  toggleColor: (color: string) => void;
  isColorFavorite: (color: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteColors: [],
      toggleColor: (color) =>
        set((state) => ({
          favoriteColors: state.favoriteColors.includes(color)
            ? state.favoriteColors.filter((c) => c !== color)
            : [...state.favoriteColors, color],
        })),
      isColorFavorite: (color) => get().favoriteColors.includes(color),
    }),
    {
      name: 'fits-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
