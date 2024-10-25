import jwtDecode from 'jwt-decode';
import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000'; // Backend API base URL

// Function to refresh the doctor token if it's expired
const updateDoctorToken = async () => {
    const refreshToken = localStorage.getItem("refresh");

    try {
        const res = await axios.post(baseURL + '/api/token/refresh/', {
            'refresh': refreshToken
        });

        if (res.status === 200) {
            localStorage.setItem('doctor_access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            const decoded = jwtDecode(res.data.access);
            
            // Assuming there’s a specific field in the token (like `is_doctor`) that marks a user as a doctor
            if (decoded.is_doctor) {
                return { 'name': decoded.first_name, isDoctor: true };
            } else {
                return { 'name': null, isDoctor: false };
            }
        } else {
            return { 'name': null, isDoctor: false };
        }
    } catch (error) {
        return { 'name': null, isDoctor: false };
    }
};

// Function to check if the doctor is authenticated
const isAuthDoctor = async () => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        return { 'name': null, isDoctor: false };
    }

    const currentTime = Date.now() / 1000;
    const decoded = jwtDecode(accessToken);

    // Check if the token has expired
    if (decoded.exp > currentTime) {
        // Validate if the user is indeed a doctor
        if (decoded.is_doctor) {
            return { 'name': decoded.first_name, isDoctor: true };
        } else {
            return { 'name': null, isDoctor: false };
        }
    } else {
        // Refresh the token if expired
        const updateSuccess = await updateDoctorToken();
        return updateSuccess;
    }
};

export default isAuthDoctor;
