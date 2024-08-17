import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // Ensure toast is properly imported
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
    const [showPassword,setShowPassword] = useState(false)
    const [showCPassword,setShowCPassword] = useState(false)

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
    
        if (!username.trim()) {
            setUsernameError('Username is required*');
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
    
        if (!phone_number.trim()){
            setPhoneError("Phone number is required");
            return;
        } else if (phone_number.length !== 10){
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
            setCPasswordError('Confirm Password is required *');
            return;
        } else if (String(cpassword) !== String(password)) {
            setCPasswordError('Passwords do not match');
            return;
        } else {
            setCPasswordError('');
        }
    
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phone_number', phone_number);
        formData.append('password', password);
    
        try {
            const res = await axios.post(`${baseURL}/api/users/signup/`, formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response:', res.data);
    
            if (res.status === 200) {
                const registeredEmail = res.data.email;
                localStorage.setItem('registeredEmail', registeredEmail);
                toast.success('OTP sent successfully');
                navigate('/otp');
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 406) {
                toast.error('Registration failed');
            } else {
                setLoginError('An error occurred during registration');
            }
        }
    };
    

    return (
        <div className="bg-gradient-to-r from-neutral-900 via-slate-900 to-zinc-600 min-h-screen flex items-center justify-center">
            <div className="flex flex-col lg:flex-row bg-white bg-opacity-90 shadow-xl rounded-lg overflow-hidden w-full max-w-4xl">
                <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Sign Up</h2>
                    <form onSubmit={handleRegistration} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-lg font-medium text-gray-700">Username</label>
                            <div className="relative mt-1">
                                <FaUser className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your name"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            {usernameError && <span className="text-sm font-medium text-red-500 mt-1">{usernameError}</span>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
                            <div className="relative mt-1">
                                <FaEnvelope className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            {emailError && <span className="text-sm font-medium text-red-500 mt-1">{emailError}</span>}
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-lg font-medium text-gray-700">Phone Number</label>
                            <div className="relative mt-1">
                                <FaPhone className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                                <input
                                    type="text"
                                    id="phone_number"
                                    name="phone_number"
                                    placeholder="Enter your phone number"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            {phoneError && <span className="text-sm font-medium text-red-500 mt-1">{phoneError}</span>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
                            <div className="relative mt-1">
                                <FaLock className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />}
                                </button>
                            </div>
                            {passwordError && <span className="text-sm font-medium text-red-500 mt-1">{passwordError}</span>}
                        </div>

                        <div>
                            <label htmlFor="password_confirm" className="block text-lg font-medium text-gray-700">Confirm Password</label>
                            <div className="relative mt-1">
                                <FaLock className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
                                <input
                                    type={showCPassword ? 'text' : 'password'}
                                    id="password_confirm"
                                    name="password_confirm"
                                    placeholder="Re-enter your password"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCPassword(!showCPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showCPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />}
                                </button>
                            </div>
                            {cpasswordError && <span className="text-sm font-medium text-red-500 mt-1">{cpasswordError}</span>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:from-teal-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                Register
                            </button>
                            {loginError && <span className="text-sm font-medium text-red-500 mt-4 block text-center">{loginError}</span>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default React.memo(UserRegistration);