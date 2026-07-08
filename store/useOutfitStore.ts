import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OutfitSlot {
  top?: string;
  bottom?: string;
  shoes?: string;
  accessory?: string;
  outerwear?: string;
}

export type Visibility = 'everyone' | 'friends' | 'only-me';

export interface Outfit {
  id: string;
  name: string;
  slots: OutfitSlot;
  favorite: boolean;
  occasion?: string;
  date?: string;
  createdAt: number;
  coverImage?: string;
  caption?: string;
  visibility?: Visibility;
  ootd?: boolean;
  selectedItemIds?: string[];
}

interface OutfitState {
  outfits: Outfit[];
  draft: OutfitSlot;
  setDraftSlot: (slot: keyof OutfitSlot, garmentId: string | undefined) => void;
  clearDraft: () => void;
  saveOutfit: (name: string, occasion?: string, date?: string) => string;
  saveFullOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt' | 'favorite'>) => string;
  toggleFavorite: (id: string) => void;
  removeOutfit: (id: string) => void;
  getOutfit: (id: string) => Outfit | undefined;
}

const seedOutfits: Outfit[] = [
  {
    id: 'o1',
    name: 'Sunday Brunch',
    slots: { top: 'g1', bottom: 'g2', shoes: 'g3', accessory: 'g7' },
    favorite: true,
    occasion: 'Brunch',
    createdAt: Date.now() - 200000,
    selectedItemIds: ['g1', 'g2', 'g3', 'g7'],
  },
  {
    id: 'o2',
    name: 'Office Chic',
    slots: { top: 'g5', bottom: 'g2', shoes: 'g9', accessory: 'g10' },
    favorite: false,
    occasion: 'Work',
    createdAt: Date.now() - 150000,
    selectedItemIds: ['g5', 'g2', 'g9', 'g10'],
  },
  {
    id: 'o3',
    name: 'Weekend Walk',
    slots: { top: 'g8', bottom: 'g6', shoes: 'g3' },
    favorite: false,
    occasion: 'Casual',
    createdAt: Date.now() - 100000,
    selectedItemIds: ['g8', 'g6', 'g3'],
  },
];

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      outfits: seedOutfits,
      draft: {},
      setDraftSlot: (slot, garmentId) =>
        set((state) => ({ draft: { ...state.draft, [slot]: garmentId } })),
      clearDraft: () => set({ draft: {} }),
      saveOutfit: (name, occasion, date) => {
        const id = `o${Date.now()}`;
        const outfit: Outfit = {
          id,
          name,
          slots: get().draft,
          favorite: false,
          occasion,
          date,
          createdAt: Date.now(),
        };
        set((state) => ({ outfits: [outfit, ...state.outfits], draft: {} }));
        return id;
      },
      saveFullOutfit: (outfit) => {
        const id = `o${Date.now()}`;
        const full: Outfit = { ...outfit, id, createdAt: Date.now(), favorite: false };
        set((state) => ({ outfits: [full, ...state.outfits] }));
        return id;
      },
      toggleFavorite: (id) =>
        set((state) => ({
          outfits: state.outfits.map((o) => (o.id === id ? { ...o, favorite: !o.favorite } : o)),
        })),
      removeOutfit: (id) => set((state) => ({ outfits: state.outfits.filter((o) => o.id !== id) })),
      getOutfit: (id) => get().outfits.find((o) => o.id === id),
    }),
    {
      name: 'fits-outfits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
