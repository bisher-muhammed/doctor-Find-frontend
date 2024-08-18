import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const slotSlice = createSlice({
    name: 'slots',
    initialState: {
        slots: [],
        selectedSlots: [],
    },
    reducers: {
        setSlots: (state, action) => {
            state.slots = action.payload;
        },
        toggleSlotSelection: (state, action) => {
            const { slotId } = action.payload;
            state.selectedSlots = state.selectedSlots.includes(slotId)
                ? state.selectedSlots.filter(id => id !== slotId)
                : [...state.selectedSlots, slotId];
        },
        deleteSlot: (state, action) => {
            const slotId = action.payload;
            state.slots = state.slots.filter(slot => slot.id !== action.payload);
        },
        updateSlot: (state, action) => {
            const updatedSlot = action.payload;
            state.slots = state.slots.map(slot =>
                slot.id === updatedSlot.id ? { ...slot, ...updatedSlot } : slot
            );
        },
    },
});

export const { setSlots, toggleSlotSelection, deleteSlot, updateSlot } = slotSlice.actions;
export default slotSlice.reducer;
