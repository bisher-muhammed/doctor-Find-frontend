import { configureStore } from '@reduxjs/toolkit';
import authenticationSliceReducer from './authenticationSlice';
import userProfileSliceReducer from './UserProfileSlice';
import slotSliceReducer from './slotSlice';

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    authUser: authenticationSliceReducer, // Handles authentication-related state
    profile: userProfileSliceReducer,      // Manages user profile state
    slots: slotSliceReducer                // Manages slot-related state
  },
});

export default store;
