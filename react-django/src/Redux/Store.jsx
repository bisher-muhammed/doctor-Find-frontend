import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { combineReducers } from '@reduxjs/toolkit';

import authenticationSliceReducer from './authenticationSlice';
import userProfileSliceReducer from './UserProfileSlice';
import slotSliceReducer from './slotSlice';
import DoctorProfileReducer from './DoctorProfileSlice';
import ChatSliceReducer from './ChatSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['authUser'], // Only persist authUser slice
};

// Auth-specific persist config for more control
const authPersistConfig = {
  key: 'authUser',
  storage,
  // You can blacklist certain fields if needed
  // blacklist: ['someTemporaryField']
};

// Combine reducers
const rootReducer = combineReducers({
  authUser: persistReducer(authPersistConfig, authenticationSliceReducer),
  profile: userProfileSliceReducer,
  slots: slotSliceReducer,
  doctorProfile: DoctorProfileReducer,
  chat: ChatSliceReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export default store;