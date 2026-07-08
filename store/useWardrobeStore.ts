import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GarmentCategory = 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear';

export interface Garment {
  id: string;
  imageUri: string;
  category: GarmentCategory;
  name: string;
  color: string;
  favorite: boolean;
  createdAt: number;
}

interface WardrobeState {
  items: Garment[];
  addItem: (item: Omit<Garment, 'id' | 'createdAt' | 'favorite'>) => string;
  removeItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getByCategory: (category: GarmentCategory) => Garment[];
}

const seedItems: Garment[] = [
  { id: 'g1', imageUri: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', category: 'tops', name: 'Cream Knit Sweater', color: '#e8d5c4', favorite: false, createdAt: Date.now() - 100000 },
  { id: 'g2', imageUri: 'https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg', category: 'bottoms', name: 'Wide Leg Trousers', color: '#3a3a3a', favorite: false, createdAt: Date.now() - 90000 },
  { id: 'g3', imageUri: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg', category: 'shoes', name: 'White Sneakers', color: '#ffffff', favorite: true, createdAt: Date.now() - 80000 },
  { id: 'g4', imageUri: 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg', category: 'outerwear', name: 'Camel Coat', color: '#c4a882', favorite: false, createdAt: Date.now() - 70000 },
  { id: 'g5', imageUri: 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg', category: 'tops', name: 'Silk Blouse', color: '#f5e6e0', favorite: false, createdAt: Date.now() - 60000 },
  { id: 'g6', imageUri: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', category: 'bottoms', name: 'Pleated Skirt', color: '#8a7960', favorite: false, createdAt: Date.now() - 50000 },
  { id: 'g7', imageUri: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg', category: 'accessories', name: 'Leather Tote', color: '#6b4e3a', favorite: false, createdAt: Date.now() - 40000 },
  { id: 'g8', imageUri: 'https://images.pexels.com/photos/19090/pexels-photo.jpg', category: 'tops', name: 'Linen Shirt', color: '#e0d4c0', favorite: false, createdAt: Date.now() - 30000 },
  { id: 'g9', imageUri: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', category: 'shoes', name: 'Ankle Boots', color: '#4a3528', favorite: false, createdAt: Date.now() - 20000 },
  { id: 'g10', imageUri: 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg', category: 'accessories', name: 'Wool Scarf', color: '#a08070', favorite: false, createdAt: Date.now() - 10000 },
];

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: seedItems,
      addItem: (item) => {
        const id = `g${Date.now()}`;
        const newItem: Garment = { ...item, id, favorite: false, createdAt: Date.now() };
        set((state) => ({ items: [newItem, ...state.items] }));
        return id;
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)),
        })),
      getByCategory: (category) => get().items.filter((i) => i.category === category),
    }),
    {
      name: 'fits-wardrobe',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
