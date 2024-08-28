import { createSlice } from '@reduxjs/toolkit';

export const authenticationSlice = createSlice({
  name: 'authUser',
  initialState: {
    userid: null,
    name: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isActive: false,
    isDoctor:false,
  },
  reducers: {
    set_authentication(state, action) {
      state.userid = action.payload.userid;
      state.name = action.payload.name;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isAdmin = action.payload.isAdmin;
      state.isActive = action.payload.isActive;
      state.token = action.payload.token;
      state.isDoctor = action.payload.isDoctor
    },
  },
});

export const { set_authentication } = authenticationSlice.actions;
export default authenticationSlice.reducer;