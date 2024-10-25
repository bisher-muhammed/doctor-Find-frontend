import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import axios from 'axios';
import { set_authentication } from '../Redux/authenticationSlice';
import { store } from '../Redux/Store';


const baseURL = 'http://127.0.0.1:8000'; // Ensure that this is correct for your backend

// Function to refresh the token
const UpdateAdminToken = async () => {
    const refreshToken = localStorage.getItem("refresh");

    try {
        const res = await axios.post(`${baseURL}/api/token/refresh/`, {
            refresh: refreshToken
        });

        if (res.status === 200) {
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            return true; // Successfully refreshed
        }
        return false; // Refresh failed
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false; // Refresh error
    }
}

// Function to check if the user is an admin
const fetchisAdmin = (decodedToken) => {
    // Modify this check according to your token structure and Redux state
    return decodedToken.is_superuser || false; // Assuming 'is_superuser' is available
};

// Function to check authentication and admin status
const isAuthAdmin = async () => {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
        // If there's no access token, update Redux state
        store.dispatch(set_authentication({
            userid: null,
            name: null,
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
            token: null,
            isDoctor: false,
            isUser: false,
        }));
        return;
    }

    const currentTime = Date.now() / 1000;
    let decodedToken;

    // Try to decode the token
    try {
        decodedToken = jwtDecode(accessToken);
    } catch (error) {
        console.error("Error decoding token:", error);
        store.dispatch(set_authentication({
            userid: null,
            name: null,
            isAuthenticated: false,
            isAdmin: false,
            isActive: false,
            token: null,
            isDoctor: false,
            isUser: false,
        }));
        return;
    }

    // Check if the token has expired
    if (decodedToken.exp > currentTime) {
        // Token is valid
        const isAdmin = fetchisAdmin(decodedToken);
        store.dispatch(set_authentication({
            userid: decodedToken.userId, // Adjust based on your token structure
            name: decodedToken.username, // Adjust based on your token structure
            isAuthenticated: true,
            isAdmin: isAdmin,
            isActive: true, // You may want to set this based on your needs
            token: accessToken,
            isDoctor: decodedToken.isDoctor || false, // Adjust based on your token structure
            isUser: decodedToken.isUser || false, // Adjust based on your token structure
        }));
    } else {
        // Token is expired, attempt to refresh
        const updateSuccess = await UpdateAdminToken();
        if (updateSuccess) {
            const newAccessToken = localStorage.getItem('access');
            const newDecodedToken = jwtDecode(newAccessToken);
            const isAdmin = fetchisAdmin(newDecodedToken);
            store.dispatch(set_authentication({
                userid: newDecodedToken.userId, // Adjust based on your token structure
                name: newDecodedToken.username, // Adjust based on your token structure
                isAuthenticated: true,
                isAdmin: isAdmin,
                isActive: true, // You may want to set this based on your needs
                token: newAccessToken,
                isDoctor: newDecodedToken.isDoctor || false, // Adjust based on your token structure
                isUser: newDecodedToken.isUser || false, // Adjust based on your token structure
            }));
        } else {
            store.dispatch(set_authentication({
                userid: null,
                name: null,
                isAuthenticated: false,
                isAdmin: false,
                isActive: false,
                token: null,
                isDoctor: false,
                isUser: false,
            }));
        }
    }
}

export default isAuthAdmin;
