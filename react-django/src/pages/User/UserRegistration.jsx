import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { registrationSchema } from '../validationSchema'; // fixed named import

import * as Yup from 'yup';

function UserRegistration() {
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const navigate = useNavigate();
    const authUser = useSelector(state => state.authUser);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authUser.isAuthenticated && !authUser.isAdmin && !authUser.isDoctor) {
            navigate('/home');
        }
    }, [authUser, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegistration = async (event) => {
        event.preventDefault();
        setFormErrors({});
        setLoginError('');

        try {
            // Validate form using Yup schema
            await registrationSchema.validate(formData, { abortEarly: false });

            setLoading(true);

            const response = await axios.post(`${baseURL}/api/users/signup/`, formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                localStorage.setItem('registeredEmail', response.data.email);
                toast.success('OTP sent successfully');
                navigate('/otp');
            }
        } catch (err) {
            if (err.name === 'ValidationError') {
                // Yup validation errors
                const errors = {};
                err.inner.forEach(e => {
                    errors[e.path] = e.message;
                });
                setFormErrors(errors);
            } else if (err.response) {
                const { data, status } = err.response;
                if (status === 400 && data.email) {
                    const message = data.email[0] || 'Email already exists';
                    setFormErrors(prev => ({ ...prev, email: message }));
                    toast.error(message);
                } else if (status === 406) {
                    toast.error('Registration failed');
                } else {
                    setLoginError('An error occurred during registration');
                }
            } else {
                setLoginError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1584508109695-6d0c9f73b6be")' }}>
            <div className="bg-white bg-opacity-90 shadow-lg rounded-lg overflow-hidden w-full max-w-md p-8">
                <h2 className="text-xl font-extrabold text-center text-black mb-6">Create Your Account</h2>

                <form onSubmit={handleRegistration} className="space-y-4">
                    <InputField Icon={FaUser} name="username" placeholder="Enter your username" value={formData.username} onChange={handleChange} error={formErrors.username} />
                    <InputField Icon={FaEnvelope} name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} error={formErrors.email} />
                    <InputField Icon={FaPhone} name="phone_number" placeholder="Enter your phone number" value={formData.phone_number} onChange={handleChange} error={formErrors.phone_number} />

                    <PasswordField name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} error={formErrors.password} />
                    <PasswordField name="password_confirm" placeholder="Confirm your password" value={formData.password_confirm} onChange={handleChange} showPassword={showCPassword} setShowPassword={setShowCPassword} error={formErrors.password_confirm} />

                    <button type="submit" className={`w-full text-amber-100 bg-slate-800 p-4 hover:bg-slate-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                        {loading ? 'Processing...' : 'Sign Up'}
                    </button>

                    {loginError && <div className="text-sm text-red-500 text-center mt-4">{loginError}</div>}
                </form>

                <div className="text-center mt-4">
                    <span className="text-gray-600">Already have an account? </span>
                    <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline">
                        Log in
                    </button>
                </div>
            </div>
        </div>
    );
}

// Reusable InputField
const InputField = ({ Icon, name, placeholder, value, onChange, error }) => (
    <div className="relative">
        <Icon className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
        <input
            type="text"
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
);

// Reusable PasswordField
const PasswordField = ({ name, placeholder, value, onChange, showPassword, setShowPassword, error }) => (
    <div className="relative">
        <FaLock className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400" />
        <input
            type={showPassword ? 'text' : 'password'}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        />
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
        >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
);

export default React.memo(UserRegistration);
