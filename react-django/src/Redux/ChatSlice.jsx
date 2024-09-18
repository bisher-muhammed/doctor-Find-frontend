import { createSlice } from '@reduxjs/toolkit';

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],  // List of chat rooms
    currentRoomId: null,  // The ID of the currently selected chat room
    uploadStatus: {},  // Track the status of file uploads
    loading: false,  // Loading state
    error: null,  // Error state
  },
  reducers: {
    setRooms(state, action) {
      state.rooms = action.payload;
      state.loading = false;  // Stop loading after rooms are set
      state.error = null;  // Clear any previous errors
    },
    addRoom(state, action) {
      state.rooms.push(action.payload);
    },
    setCurrentRoom(state, action) {
      state.currentRoomId = action.payload;
    },
    setUploadStatus(state, action) {
      const { messageId, status } = action.payload;
      state.uploadStatus[messageId] = status;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;  // Stop loading if there's an error
    },
  },
});

export const {
  setRooms,
  addRoom,
  setCurrentRoom,
  setUploadStatus,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
