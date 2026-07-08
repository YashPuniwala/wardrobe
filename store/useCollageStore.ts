import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CollageLayer {
  id: string;
  type: 'garment' | 'sticker';
  source: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface CollageState {
  layers: CollageLayer[];
  background: string;
  selectedLayerId: string | null;
  hasEdits: boolean;
  coverImage: string | null;
  addLayer: (layer: Omit<CollageLayer, 'id' | 'zIndex'>) => void;
  updateLayer: (id: string, updates: Partial<CollageLayer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setBackground: (bg: string) => void;
  setCoverImage: (uri: string | null) => void;
  clear: () => void;
  initFromGarments: (garments: { id: string; imageUri: string; category: string }[]) => void;
}

export const useCollageStore = create<CollageState>()(
  persist(
    (set, get) => ({
      layers: [],
      background: '#fff8f7',
      selectedLayerId: null,
      hasEdits: false,
      coverImage: null,
      addLayer: (layer) => {
        const id = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const maxZ = get().layers.reduce((max, l) => Math.max(max, l.zIndex), 0);
        set((s) => ({
          layers: [...s.layers, { ...layer, id, zIndex: maxZ + 1 }],
          selectedLayerId: id,
          hasEdits: true,
        }));
      },
      updateLayer: (id, updates) =>
        set((s) => ({
          layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
          hasEdits: true,
        })),
      removeLayer: (id) =>
        set((s) => ({
          layers: s.layers.filter((l) => l.id !== id),
          selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
          hasEdits: true,
        })),
      selectLayer: (id) => set({ selectedLayerId: id }),
      bringToFront: (id) => {
        const maxZ = get().layers.reduce((max, l) => Math.max(max, l.zIndex), 0);
        set((s) => ({
          layers: s.layers.map((l) => (l.id === id ? { ...l, zIndex: maxZ + 1 } : l)),
          hasEdits: true,
        }));
      },
      sendToBack: (id) => {
        const minZ = get().layers.reduce((min, l) => Math.min(min, l.zIndex), 0);
        set((s) => ({
          layers: s.layers.map((l) => (l.id === id ? { ...l, zIndex: minZ - 1 } : l)),
          hasEdits: true,
        }));
      },
      setBackground: (bg) => set({ background: bg, hasEdits: true }),
      setCoverImage: (uri) => set({ coverImage: uri }),
      clear: () => set({ layers: [], background: '#fff8f7', selectedLayerId: null, hasEdits: false, coverImage: null }),
      initFromGarments: (garments) => {
        const layers: CollageLayer[] = garments.map((g, i) => {
          const yOffset = g.category === 'tops' ? -80 : g.category === 'bottoms' ? 0 : g.category === 'shoes' ? 80 : g.category === 'outerwear' ? -120 : 40;
          const xOffset = (i % 2 === 0 ? -30 : 30) + (i - Math.floor(garments.length / 2)) * 20;
          return {
            id: `layer_${Date.now()}_${i}`,
            type: 'garment' as const,
            source: g.imageUri,
            x: xOffset,
            y: yOffset,
            scale: 1,
            rotation: 0,
            zIndex: i,
          };
        });
        set({ layers, hasEdits: false, selectedLayerId: null });
      },
    }),
    {
      name: 'fits-collage-draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
