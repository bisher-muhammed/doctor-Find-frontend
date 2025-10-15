import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaUserMd } from 'react-icons/fa';

function Loginpage() {
  const [formErrors, setFormErrors] = useState({});
  const [shakeGeneralError, setShakeGeneralError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState('');

  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector(state => state.authUser);

  useEffect(() => {
    if (
      authentication_user.isAuthenticated &&
      authentication_user.isUser &&
      !authentication_user.isAdmin &&
      !authentication_user.isDoctor
    ) {
      navigate('/home');
    }
  }, [authentication_user, navigate]);

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFocus = (field) => setFocusedField(field);

  const handleBlur = async () => {
    if (focusedField) {
      try {
        await loginSchema.validateAt(focusedField, formData);
        setFormErrors(prev => ({ ...prev, [focusedField]: '' }));
      } catch (err) {
        setFormErrors(prev => ({ ...prev, [focusedField]: err.message }));
      }
      setFocusedField('');
    }
  };

  const triggerShakeAnimation = () => {
    setShakeGeneralError(false);
    requestAnimationFrame(() => {
      setShakeGeneralError(true);
      setTimeout(() => setShakeGeneralError(false), 400);
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    try {
      await loginSchema.validate(formData, { abortEarly: false });

      const trimmedEmail = formData.email.trim();
      const submitData = new FormData();
      submitData.append('email', trimmedEmail);
      submitData.append('password', formData.password);

      const res = await axios.post(`${baseURL}/api/users/login/`, submitData);

      if (res.status === 200) {
        toast.success('🎉 Welcome back! Login successful');
        const { access_token, refresh_token, userid } = res.data;
        const username = jwtDecode(access_token).username;

        localStorage.setItem('access', access_token);
        localStorage.setItem('refresh', refresh_token);
        localStorage.setItem('userid', userid);

        dispatch(
          set_authentication({
            name: username,
            isAuthenticated: true,
            isUser: true,
            userid,
            isAdmin: false,
            isDoctor: false,
          })
        );

        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(e => {
          validationErrors[e.path] = e.message;
        });
        setFormErrors(validationErrors);
      } else if (error.response && error.response.status === 401) {
        setFormErrors({ general: 'Invalid email or password.' });
        triggerShakeAnimation();
      } else {
        setFormErrors({ general: 'Something went wrong. Please try again.' });
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-pink-300 rounded-full opacity-10 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-600 text-lg mt-2">Choose your login type</p>
        </div>

        {/* Session Type Switcher */}
        <div className="mb-8">
          <div className="flex bg-gray-100 rounded-2xl p-1.5">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold bg-white text-blue-600 shadow-md border border-blue-100 transition-all duration-300"
            >
              <FaUser className="text-lg" />
              <span>Patient Login</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctor/login')}
              className="flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-300"
            >
              <FaUserMd className="text-lg" />
              <span>Doctor Login</span>
            </button>
          </div>
        </div>

        {/* Current Session Info */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-center mb-6">
          <p className="font-medium">
            👤 Patient Session - Book appointments and manage your health
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 shadow-sm text-base focus:outline-none focus:ring-4 transition-all ${
                  formErrors.email
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                    : focusedField === 'email'
                    ? 'border-blue-500 bg-blue-50 focus:ring-blue-200'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              />
            </div>
            {formErrors.email && <p className="text-sm text-red-600 mt-1 animate-shake">{formErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 shadow-sm text-base focus:outline-none focus:ring-4 transition-all ${
                  formErrors.password
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                    : focusedField === 'password'
                    ? 'border-blue-500 bg-blue-50 focus:ring-blue-200'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.password && <p className="text-sm text-red-600 mt-1 animate-shake">{formErrors.password}</p>}
          </div>

          {/* General Error */}
          {formErrors.general && (
            <div className={`bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl ${shakeGeneralError ? 'animate-shake' : ''}`}>
              {formErrors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-lg font-semibold text-white transition-all duration-300 ${
              !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Signing you in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center space-y-4 text-sm text-gray-600">
          <Link 
            to="/fpassword" 
            className="text-blue-600 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
          <div>
            New here?{' '}
            <Link 
              to="/signup" 
              className="text-blue-600 font-medium hover:underline transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Doctor Redirect Notice */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-green-700 text-sm">
            Are you a doctor?{' '}
            <button
              onClick={() => navigate('/doctor/login')}
              className="text-green-600 font-semibold hover:underline transition-colors"
            >
              Switch to Doctor Login
            </button>
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx="true">{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Loginpage;
