import { configureStore } from '@reduxjs/toolkit';
import authenticationSliceReducer from './authenticationSlice';

const Store = configureStore({
  reducer: {
    authentication_user: authenticationSliceReducer,
  },
});

export default Store;
