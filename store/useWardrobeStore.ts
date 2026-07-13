import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

export type GarmentCategory = 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear';

export interface Garment {
  id: string;
  imageUri: string;
  category: GarmentCategory;
  subCategory?: string;
  name: string;
  color: string;
  favorite: boolean;
  createdAt: number;
  /** Optional manual size correction multiplier (default 1.0).
   *  Applied to the fixed bounding box in the dressing room to compensate
   *  for varying amounts of transparent padding in source photos. */
  fitScale?: number;
}

interface WardrobeState {
  items: Garment[];
  addItem: (item: Omit<Garment, 'id' | 'createdAt' | 'favorite'>) => string;
  removeItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getByCategory: (category: GarmentCategory) => Garment[];
  getBySubCategory: (category: GarmentCategory, subCategory: string) => Garment[];
}

const seedItems: Garment[] = [
  // TOPS
  {
    id: 'g1',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-top1.webp')).uri,
    category: 'tops',
    subCategory: 'sweater',
    name: 'Cream Knit Sweater',
    color: '#e8d5c4',
    favorite: false,
    createdAt: Date.now() - 140000,
    fitScale: 1.0,
  },
  {
    id: 'g5',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-top3.webp')).uri,
    category: 'tops',
    subCategory: 't-shirt',
    name: 'Olive T-Shirt',
    color: '#8a9e80',
    favorite: false,
    createdAt: Date.now() - 100000,
    fitScale: 0.90,
  },
  {
    id: 'g8',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-top4.webp')).uri,
    category: 'tops',
    subCategory: 'polo',
    name: 'Graphic Polo',
    color: '#e0d4c0',
    favorite: false,
    createdAt: Date.now() - 70000,
    fitScale: 0.95,
  },
  {
    id: 'g11',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-top5.png')).uri,
    category: 'tops',
    subCategory: 't-shirt',
    name: 'Black Tee',
    color: '#111111',
    favorite: false,
    createdAt: Date.now() - 40000,
    fitScale: 0.88,
  },

  // BOTTOMS
  {
    id: 'g2',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-jeans1.png')).uri,
    category: 'bottoms',
    subCategory: 'pants',
    name: 'Wide Leg Trousers',
    color: '#3a3a3a',
    favorite: false,
    createdAt: Date.now() - 130000,
    fitScale: 0.95,
  },
  {
    id: 'g6',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-jeans2.png')).uri,
    category: 'bottoms',
    subCategory: 'jeans',
    name: 'Classic Denim',
    color: '#4a607a',
    favorite: false,
    createdAt: Date.now() - 90000,
    fitScale: 1.0,
  },
  {
    id: 'g12',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-jeans3.png')).uri,
    category: 'bottoms',
    subCategory: 'jeans',
    name: 'Slim Blue Jeans',
    color: '#3a5070',
    favorite: false,
    createdAt: Date.now() - 30000,
    fitScale: 0.95,
  },
  {
    id: 'g13',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-jeans4.png')).uri,
    category: 'bottoms',
    subCategory: 'jeans',
    name: 'Ripped Denim',
    color: '#5a7090',
    favorite: false,
    createdAt: Date.now() - 20000,
    fitScale: 0.92,
  },
  {
    id: 'g14',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-jeans5.png')).uri,
    category: 'bottoms',
    subCategory: 'jeans',
    name: 'Dark Wash Jeans',
    color: '#203040',
    favorite: false,
    createdAt: Date.now() - 10000,
    fitScale: 0.92,
  },

  // SHOES — g7 and g10 fixed from 'accessories' → 'shoes'
  {
    id: 'g3',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-shoes1.png')).uri,
    category: 'shoes',
    subCategory: 'sneakers',
    name: 'White Sneakers',
    color: '#ffffff',
    favorite: true,
    createdAt: Date.now() - 120000,
    fitScale: 1.0,
  },
  {
    id: 'g7',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-shoes2.png')).uri,
    category: 'shoes',
    subCategory: 'sneakers',
    name: 'Casual Dark Shoes',
    color: '#1a1a1a',
    favorite: false,
    createdAt: Date.now() - 80000,
    fitScale: 0.95,
  },
  {
    id: 'g9',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-shoes3.png')).uri,
    category: 'shoes',
    subCategory: 'sneakers',
    name: 'Grey Running Shoes',
    color: '#7a7a7a',
    favorite: false,
    createdAt: Date.now() - 60000,
    fitScale: 1.05,
  },
  {
    id: 'g10',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-shoes5.png')).uri,
    category: 'shoes',
    subCategory: 'sneakers',
    name: 'Stylish Sneakers',
    color: '#d0c0b0',
    favorite: false,
    createdAt: Date.now() - 50000,
    fitScale: 1.0,
  },

  // OUTERWEAR
  {
    id: 'g4',
    imageUri: Image.resolveAssetSource(require('@/assets/images/men-top2.webp')).uri,
    category: 'outerwear',
    subCategory: 'jacket',
    name: 'Casual Jacket',
    color: '#c4a882',
    favorite: false,
    createdAt: Date.now() - 110000,
    fitScale: 1.0,
  },
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
      getBySubCategory: (category, subCategory) =>
        get().items.filter((i) => i.category === category && i.subCategory === subCategory),
    }),
    {
      name: 'fits-wardrobe-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
