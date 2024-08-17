import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { set_authentication } from "../../Redux/authenticationSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Input, Button } from "@material-tailwind/react";

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const baseURL = 'http://127.0.0.1:8000';

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
                localStorage.setItem('refresh', res.data.refresh_token); // Corrected the typo 'refresh_roken' to 'refresh_token'
                console.log('response is given by', res.status);

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
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Admin Login</h2>
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
                        <Button color="blue" ripple="light" fullWidth type="submit">
                            Login
                        </Button>
                        {loginError && <p className="text-red-500">{loginError}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;

