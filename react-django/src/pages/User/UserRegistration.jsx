import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

function UserRegistration() {
    const baseURL = 'http://127.0.0.1:8000';
    const navigate = useNavigate();

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [cpasswordError, setCPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

    const authentication_user = useSelector(state => state.authUser);
    
    useEffect(() => {
        if (authentication_user.isAuthenticated && !authentication_user.isAdmin && !authentication_user.isDoctor) {
            navigate('/home');
        }
    }, [authentication_user, navigate]);

    const handleRegistration = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const email = event.target.email.value;
        const phone_number = event.target.phone_number.value;
        const password = event.target.password.value;
        const cpassword = event.target.password_confirm.value;
        const alphabeticRegex = /^[A-Za-z]+$/;

        // Validation checks
        if (!username.trim()) {
            setUsernameError('Username is required');
            return;
        } else if (!alphabeticRegex.test(username)) {
            setUsernameError('Username must contain only alphabetic characters');
            return;
        } else if (username.length < 4) {
            setUsernameError('Username must be at least 4 characters');
            return;
        } else {
            setUsernameError('');
        }

        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        } else {
            setEmailError('');
        }

        if (!phone_number.trim()) {
            setPhoneError("Phone number is required");
            return;
        } else if (phone_number.length !== 10) {
            setPhoneError('Phone number must be 10 digits');
            return;
        } else {
            setPhoneError('');
        }

        if (!password.trim()) {
            setPasswordError("Password is required");
            return;
        } else if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        } else {
            setPasswordError('');
        }

        if (!cpassword.trim()) {
            setCPasswordError('Confirm Password is required');
            return;
        } else if (cpassword !== password) {
            setCPasswordError('Passwords do not match');
            return;
        } else {
            setCPasswordError('');
        }

        // Submit form data to the server
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phone_number', phone_number);
        formData.append('password', password);

        try {
            const res = await axios.post(`${baseURL}/api/users/signup/`, formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.status === 200) {
                const registeredEmail = res.data.email;
                localStorage.setItem('registeredEmail', registeredEmail);
                toast.success('OTP sent successfully');
                navigate('/otp');
            }
        } catch (error) {
            if (error.response && error.response.status === 406) {
                toast.error('Registration failed');
            } else {
                setLoginError('An error occurred during registration');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1584508109695-6d0c9f73b6be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3N3wwfDF8c2VhcmNofDF8fGhvcnBpdGFsfGVufDB8fHx8MTY4MTc3MTk0MA&ixlib=rb-1.2.1&q=80&w=1080")' }}>
            <div className="bg-white bg-opacity-90 shadow-lg rounded-lg overflow-hidden w-full max-w-md p-8">
                <h2 className="text-xl font-extrabold text-center text-black mb-6">Create Your Account</h2>

                <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="relative">
                        <FaUser className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                        {usernameError && <span className="text-sm text-red-500">{usernameError}</span>}
                    </div>

                    <div className="relative">
                        <FaEnvelope className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                        {emailError && <span className="text-sm text-red-500">{emailError}</span>}
                    </div>

                    <div className="relative">
                        <FaPhone className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                        <input
                            type="text"
                            id="phone_number"
                            name="phone_number"
                            placeholder="Enter your phone number"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                        {phoneError && <span className="text-sm text-red-500">{phoneError}</span>}
                    </div>

                    <div className="relative">
                        <FaLock className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {passwordError && <span className="text-sm text-red-500">{passwordError}</span>}
                    </div>

                    <div className="relative">
                        <FaLock className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                        <input
                            type={showCPassword ? 'text' : 'password'}
                            id="password_confirm"
                            name="password_confirm"
                            placeholder="Confirm your password"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCPassword(!showCPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                            {showCPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {cpasswordError && <span className="text-sm text-red-500">{cpasswordError}</span>}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-amber-100 bg-slate-800 p-4 hover:bg-slate-500"
                    >
                        Sign Up
                    </button>

                    {loginError && <div className="text-sm text-red-500 text-center mt-4">{loginError}</div>}
                </form>
                <div className="text-center mt-4">
                    <span className="text-gray-600">Already have an account? </span>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="text-blue-500 hover:underline"
                    >
                        Log in
                    </button>
                </div>
            </div>
        </div>
    );
}

export default React.memo(UserRegistration);