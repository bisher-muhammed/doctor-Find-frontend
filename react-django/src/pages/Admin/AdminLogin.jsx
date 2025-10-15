import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { set_authentication } from "../../Redux/authenticationSlice";
import {jwtDecode} from "jwt-decode"; // Corrected the import
import axios from "axios";
import { Input, Button } from "@material-tailwind/react";
import Aimage from '../../assets/Aimage.jpg';

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const baseURL = 'import.meta.env.VITE_REACT_APP_API_URL'

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setEmailError('');
        setPasswordError('');
        setLoginError('');

        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!password.trim()) {
            setPasswordError('Password is required');
            return;
        }

        try {
            const res = await axios.post(baseURL + '/api/admin/admin/login/', formData);
            if (res.status === 200) {
                localStorage.setItem('access', res.data.access_token);
                localStorage.setItem('refresh', res.data.refresh_token);

                dispatch(
                    set_authentication({
                        name: jwtDecode(res.data.access_token).username,
                        isAuthenticated: true,
                        isAdmin: res.data.isAdmin,
                        isDoctor: res.data.isDoctor
                    })
                );
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error('Error during login', error);
            setLoginError('Invalid Credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col-reverse md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-700">Admin Login</h2>
                    <form className="space-y-6" onSubmit={handleLoginSubmit}>
                        <div>
                            <Input
                                type="email"
                                label="Email"
                                name="email"
                                error={emailError}
                            />
                            {emailError && <p className="text-red-500">{emailError}</p>}
                        </div>
                        <div>
                            <Input
                                type="password"
                                label="Password"
                                name="password"
                                error={passwordError}
                            />
                            {passwordError && <p className="text-red-500">{passwordError}</p>}
                        </div>
                        <div>
                            <Button color="gray" ripple="dark" fullWidth type="submit">
                                Login
                            </Button>
                            {loginError && <p className="text-red-500">{loginError}</p>}
                        </div>
                    </form>
                </div>

                {/* Right Side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <img
                        src={Aimage}
                        alt="Admin Login"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
