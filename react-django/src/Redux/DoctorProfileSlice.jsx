import { createSlice } from "@reduxjs/toolkit";

const DoctorProfileSlice = createSlice({
    name: 'doctorProfile',
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
        country: null,
        profile_pic: null,
        specification: null,
        experience: null,
        id: null // Add id if it's part of the profile data
    },
    reducers: {
        set_doctor_profile_details: (state, action) => {
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
            state.country = action.payload.country;
            state.profile_pic = action.payload.profile_pic;
            state.specification = action.payload.specification;
            state.experience = action.payload.experience;
            state.id = action.payload.id; // Ensure this line is included
        }
    }
});

export const { set_doctor_profile_details } = DoctorProfileSlice.actions;

export default DoctorProfileSlice.reducer;

