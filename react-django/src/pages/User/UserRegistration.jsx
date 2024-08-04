import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // Ensure toast is properly imported
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function UserRegistration() {
    const baseURL = 'http://127.0.0.1:8000';
    const navigate = useNavigate();

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [cpasswordError, setCPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword,setShowPassword] = useState(false)
    const [showCPassword,setShowCPassword] = useState(false)

    const authentication_user = useSelector(state => state.authentication_user);
    
    useEffect(() => {
        if (authentication_user.isAuthenticated && !authentication_user.isAdmin) {
            navigate('/home');
        }
    }, [authentication_user, navigate]);

    const handleRegistration = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const email = event.target.email.value;
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
        } else if (cpassword !== password) {
            setCPasswordError('Passwords do not match');
            return;
        } else {
            setCPasswordError('');
        }

        const data = {
            username,
            email,
            password
        };

        try {
            const res = await axios.post(`${baseURL}/api/users/signup/`, data, {
                headers: { 'Content-Type': 'application/json' }
            });

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
        <div className="bg-zinc-600">
            <div className="flex flex-col items-center justify-between pt-0 pr-10 pb-0 pl-10 mt-0 mr-auto mb-0 ml-auto max-w-7xl xl:px-5 lg:flex-row">
                <div className="flex flex-col items-center w-full pt-5 pr-10 pb-20 pl-10 lg:flex-row">
                    <div className="w-full bg-cover relative max-w-md lg:max-w-2xl lg:w-7/12">
                        <div className="flex flex-col items-center justify-center w-full h-full relative lg:pr-10 mr-10">
                            <img src="https://www.freepikcompany.com/img/designers.svg" alt="Health Run" className="btn-" style={{ marginRight: 100 }} />
                        </div>
                    </div>

                    <div className="w-full mt-10 mr-0 mb-0 ml-0 relative z-10 max-w-2xl lg:mt-0 lg:w-5/12">
                        <div className="flex flex-col items-start justify-start pt-10 pr-10 pb-10 pl-10 bg-stone-300 shadow-xl rounded-xl relative z-10">
                            <p className="w-full text-4xl font-medium text-center text-black leading-snug font-serif">Sign up for an account</p>

                            <div className="w-full mt-6 mr-0 mb-0 ml-0 relative space-y-8">
                                <div className="bg-teal-950 p-6 rounded-lg">
                                    <form onSubmit={handleRegistration} className="space-y-4">
                                        <div className="relative">
                                            <label htmlFor="username" className="block font-medium text-black">Username</label>
                                            <input type="text" id="username" name="username" placeholder="Enter your name" className="w-full mt-1 p-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                                            {usernameError && <span className="text-sm font-bold text-red-500 mt-1 mb-5">{usernameError}</span>}
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="email" className="block font-medium text-black">Email</label>
                                            <input type="email" id="email" name="email" placeholder="Enter your email" className="w-full mt-1 p-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                                            {emailError && <span className="text-sm font-bold text-red-500 mt-1 mb-5">{emailError}</span>}
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="password" className="block font-medium text-black">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    placeholder="Enter your password"
                                                    className="w-full mt-1 p-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {passwordError && <span className="text-sm font-bold text-red-500 mt-1 mb-5">{passwordError}</span>}
                                        </div>

                                        <div className="relative">
                                            <label htmlFor="password_confirm" className="block font-medium text-black">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCPassword ? 'text' : 'password'}
                                                    id="password_confirm"
                                                    name="password_confirm"
                                                    placeholder="Re-enter your password"
                                                    className="w-full mt-1 p-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCPassword(!showCPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                >
                                                    {showCPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {cpasswordError && <span className="text-sm font-bold text-red-500 mt-1 mb-5">{cpasswordError}</span>}
                                        </div>



                                        <div className="relative">
                                            <input type="submit" value="Submit" className="w-full mt-1 p-2 bg-red-500 text-white font-medium rounded-md cursor-pointer hover:bg-green-700" />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserRegistration;
