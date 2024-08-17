import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Create a slice for slot management
const slotSlice = createSlice({
    name: 'slots',
    initialState: {
        slots: [],               // Array of slots
        selectedSlots: [],       // Array of selected slot IDs
    },
    reducers: {
        // Set slots in the state
        setSlots: (state, action) => {
            state.slots = action.payload;
        },
        // Toggle the selection of a slot
        toggleSlotSelection: (state, action) => {
            const { slotId } = action.payload;
            state.selectedSlots = state.selectedSlots.includes(slotId)
                ? state.selectedSlots.filter(id => id !== slotId)
                : [...state.selectedSlots, slotId];
        },

        deleteSlot: (state, action) => {
            const slotId = action.payload;
            state.slots = state.slots.filter(slot => slot.id !== slotId);
            state.selectedSlots = state.selectedSlots.filter(id => id !== slotId);
        },
    },
});

export const { setSlots, toggleSlotSelection, deleteSlot } = slotSlice.actions;
export default slotSlice.reducer;

