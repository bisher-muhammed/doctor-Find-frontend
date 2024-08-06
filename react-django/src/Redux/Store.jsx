import { configureStore } from '@reduxjs/toolkit';
import authenticationSliceReducer from './authenticationSlice';

const Store = configureStore({
  reducer: {
    authUser: authenticationSliceReducer, // Use the key from your slice
  },
});

export default Store;
