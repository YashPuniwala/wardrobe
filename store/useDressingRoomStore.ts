import { create } from 'zustand';
import { Garment } from './useWardrobeStore';

export type DressingRoomSlot = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory';

export interface SlotState {
  garmentId: string | null;
  locked: boolean;
  offsetX: number;
  offsetY: number;
  scaleAdjust: number;
}

const defaultSlot = (): SlotState => ({
  garmentId: null,
  locked: false,
  offsetX: 0,
  offsetY: 0,
  scaleAdjust: 1,
});

const resetOffsets = (slot: SlotState): SlotState => ({
  ...slot,
  offsetX: 0,
  offsetY: 0,
  scaleAdjust: 1,
});

interface DressingRoomState {
  slots: Record<DressingRoomSlot, SlotState>;
  activeSlot: DressingRoomSlot | null;
  initFromSelection: (garmentIds: string[], wardrobeItems: Garment[]) => void;
  setActiveSlot: (slot: DressingRoomSlot | null) => void;
  setSlotGarment: (slot: DressingRoomSlot, garmentId: string | null) => void;
  toggleLock: (slot: DressingRoomSlot) => void;
  removeSlotGarment: (slot: DressingRoomSlot) => void;
  setSlotOffset: (
    slot: DressingRoomSlot,
    offsetX: number,
    offsetY: number,
    scaleAdjust: number
  ) => void;
  shuffleSlot: (slot: DressingRoomSlot, wardrobeItems: Garment[]) => void;
  shuffleAll: (wardrobeItems: Garment[]) => void;
  reset: () => void;
}

/** Map a garment's category to the correct slot key */
function categoryToSlot(category: string): DressingRoomSlot | null {
  switch (category) {
    case 'tops':
      return 'top';
    case 'bottoms':
      return 'bottom';
    case 'shoes':
      return 'shoes';
    case 'outerwear':
      return 'outerwear';
    case 'accessories':
      return 'accessory';
    default:
      return null;
  }
}

/** Map a slot key back to the garment category string */
export function slotToCategory(slot: DressingRoomSlot): string {
  switch (slot) {
    case 'top':
      return 'tops';
    case 'bottom':
      return 'bottoms';
    case 'shoes':
      return 'shoes';
    case 'outerwear':
      return 'outerwear';
    case 'accessory':
      return 'accessories';
  }
}

const initialSlots: Record<DressingRoomSlot, SlotState> = {
  top: defaultSlot(),
  bottom: defaultSlot(),
  shoes: defaultSlot(),
  outerwear: defaultSlot(),
  accessory: defaultSlot(),
};

export const useDressingRoomStore = create<DressingRoomState>()((set, get) => ({
  slots: { ...initialSlots },
  activeSlot: null,

  initFromSelection: (garmentIds, wardrobeItems) => {
    const newSlots: Record<DressingRoomSlot, SlotState> = {
      top: defaultSlot(),
      bottom: defaultSlot(),
      shoes: defaultSlot(),
      outerwear: defaultSlot(),
      accessory: defaultSlot(),
    };

    for (const id of garmentIds) {
      const garment = wardrobeItems.find((g) => g.id === id);
      if (!garment) continue;
      const slot = categoryToSlot(garment.category);
      if (!slot) continue;
      // First encountered item wins for each slot
      if (newSlots[slot].garmentId === null) {
        newSlots[slot] = { ...defaultSlot(), garmentId: id };
      }
    }

    set({ slots: newSlots, activeSlot: null });
  },

  setActiveSlot: (slot) => set({ activeSlot: slot }),

  setSlotGarment: (slot, garmentId) =>
    set((state) => ({
      slots: {
        ...state.slots,
        [slot]: resetOffsets({ ...state.slots[slot], garmentId }),
      },
    })),

  toggleLock: (slot) =>
    set((state) => ({
      slots: {
        ...state.slots,
        [slot]: { ...state.slots[slot], locked: !state.slots[slot].locked },
      },
    })),

  removeSlotGarment: (slot) =>
    set((state) => ({
      slots: {
        ...state.slots,
        [slot]: defaultSlot(),
      },
      activeSlot: state.activeSlot === slot ? null : state.activeSlot,
    })),

  setSlotOffset: (slot, offsetX, offsetY, scaleAdjust) =>
    set((state) => ({
      slots: {
        ...state.slots,
        [slot]: { ...state.slots[slot], offsetX, offsetY, scaleAdjust },
      },
    })),

  shuffleSlot: (slot, wardrobeItems) => {
    const { slots } = get();
    const currentId = slots[slot].garmentId;
    const category = slotToCategory(slot);
    const candidates = wardrobeItems.filter(
      (g) => g.category === category && g.id !== currentId
    );
    if (candidates.length === 0) return;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    set((state) => ({
      slots: {
        ...state.slots,
        [slot]: resetOffsets({ ...state.slots[slot], garmentId: next.id }),
      },
    }));
  },

  shuffleAll: (wardrobeItems) => {
    const { slots } = get();
    const slotKeys: DressingRoomSlot[] = ['top', 'bottom', 'shoes', 'outerwear', 'accessory'];
    const newSlots = { ...slots };

    for (const slot of slotKeys) {
      if (newSlots[slot].locked || newSlots[slot].garmentId === null) continue;
      const currentId = newSlots[slot].garmentId;
      const category = slotToCategory(slot);
      const candidates = wardrobeItems.filter(
        (g) => g.category === category && g.id !== currentId
      );
      if (candidates.length === 0) continue;
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      newSlots[slot] = resetOffsets({ ...newSlots[slot], garmentId: next.id });
    }

    set({ slots: newSlots });
  },

  reset: () => set({ slots: { ...initialSlots }, activeSlot: null }),
}));
