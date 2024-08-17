import { createSlice } from "@reduxjs/toolkit";

const UserProfileSlice = createSlice({
  name: 'profile',  // Name of the slice
  initialState: {
    username: null,
    first_name: null,
    last_name: null,
    date_of_birth: null,
    gender: null,
    email: null,
    phone: null,
    address: null,
    state: null,
    city: null,
    country: null,  // Fixed typo from "cuntry" to "country"
    profile_pic: null,
  },
  reducers: {
    set_profile_details: (state, action) => {
      state.username = action.payload.username;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.date_of_birth = action.payload.date_of_birth;
      state.gender = action.payload.gender;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.address = action.payload.address;
      state.state = action.payload.state;
      state.city = action.payload.city;
      state.country = action.payload.country;  // Fixed typo
      state.profile_pic = action.payload.profile_pic;
    },
    // Add more reducers if necessary, like `clear_profile_details` to reset the state.
  },
});

export const { set_profile_details } = UserProfileSlice.actions;

export default UserProfileSlice.reducer;
