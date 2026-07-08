import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BuildMethod = 'collage' | 'dressing-room' | 'ai-tryon';

export type Visibility = 'everyone' | 'friends' | 'only-me';

export type Occasion = 'Casual' | 'Formal' | 'Work' | 'Party' | 'Date Night' | 'Brunch' | 'Workout' | 'Travel';

interface OutfitDraftState {
  selectedItemIds: string[];
  referencePhoto: string | null;
  date: string | null;
  caption: string;
  occasion: Occasion | null;
  visibility: Visibility;
  ootd: boolean;
  buildMethod: BuildMethod | null;
  askEveryTime: boolean;
  lastMethod: BuildMethod | null;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setReferencePhoto: (uri: string | null) => void;
  setDate: (date: string | null) => void;
  setCaption: (caption: string) => void;
  setOccasion: (occasion: Occasion | null) => void;
  setVisibility: (visibility: Visibility) => void;
  setOotd: (ootd: boolean) => void;
  setBuildMethod: (method: BuildMethod) => void;
  setAskEveryTime: (ask: boolean) => void;
  setLastMethod: (method: BuildMethod) => void;
  reset: () => void;
}

export const useOutfitDraftStore = create<OutfitDraftState>()(
  persist(
    (set) => ({
      selectedItemIds: [],
      referencePhoto: null,
      date: null,
      caption: '',
      occasion: null,
      visibility: 'everyone',
      ootd: false,
      buildMethod: null,
      askEveryTime: true,
      lastMethod: null,
      toggleItem: (id) =>
        set((s) => ({
          selectedItemIds: s.selectedItemIds.includes(id)
            ? s.selectedItemIds.filter((x) => x !== id)
            : [...s.selectedItemIds, id],
        })),
      removeItem: (id) =>
        set((s) => ({ selectedItemIds: s.selectedItemIds.filter((x) => x !== id) })),
      clearItems: () => set({ selectedItemIds: [] }),
      setReferencePhoto: (uri) => set({ referencePhoto: uri }),
      setDate: (date) => set({ date }),
      setCaption: (caption) => set({ caption }),
      setOccasion: (occasion) => set({ occasion }),
      setVisibility: (visibility) => set({ visibility }),
      setOotd: (ootd) => set({ ootd }),
      setBuildMethod: (method) => set({ buildMethod: method }),
      setAskEveryTime: (ask) => set({ askEveryTime: ask }),
      setLastMethod: (method) => set({ lastMethod: method }),
      reset: () =>
        set({
          selectedItemIds: [],
          referencePhoto: null,
          date: null,
          caption: '',
          occasion: null,
          visibility: 'everyone',
          ootd: false,
          buildMethod: null,
        }),
    }),
    {
      name: 'fits-outfit-draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
