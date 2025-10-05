import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Eye, EyeOff, Stethoscope, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

import {
  Button,
  Card,
  CardBody,
  Input,
  Typography,
} from '@material-tailwind/react';

function DoctorLogin() {
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authUser);

  useEffect(() => {
    if (authentication_user.isAuthenticated && authentication_user.isDoctor) {
      navigate('/doctor/home');
    }
  }, [authentication_user.isAuthenticated, authentication_user.isDoctor, navigate]);

  // Enhanced Yup validation schema
  const doctorLoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  // Handle input changes for real-time error clearing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    const email = event.target.email.value.trim();
    const password = event.target.password.value;

    const formDataObject = { email, password };

    try {
      await doctorLoginSchema.validate(formDataObject, { abortEarly: false });

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res = await axios.post(`${baseURL}/api/doctors/doctor/login/`, formData);
      const verified = res.data.isEmailVerified;

      if (res.status === 200) {
        toast.success('Login successful! Welcome back, Doctor.');

        localStorage.setItem('access', res.data.access_token);
        localStorage.setItem('refresh', res.data.refresh_token);
        localStorage.setItem('userid', res.data.userid);

        dispatch(
          set_authentication({
            userid: res.data.userid,
            name: jwtDecode(res.data.access_token).username,
            isAuthenticated: true,
            isAdmin: false,
            isActive: verified,
            token: res.data.access_token,
            isDoctor: true,
          })
        );

        if (verified) {
          navigate('/doctor/home');
        } else {
          navigate('/doctor/notapproved');
        }
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setFormErrors(errors);
      } else if (error.response && error.response.status === 401) {
        toast.error('Invalid credentials');
        setFormErrors({ general: 'Invalid email or password. Please check your credentials.' });
      } else if (error.response && error.response.status === 429) {
        toast.error('Too many login attempts');
        setFormErrors({ general: 'Too many login attempts. Please try again later.' });
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timeout');
        setFormErrors({ general: 'Connection timeout. Please check your internet and try again.' });
      } else {
        toast.error('An error occurred. Please try again later.');
        setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
            Doctor Login
          </Typography>
          <Typography variant="small" color="gray" className="font-medium">
            Sign in to access your medical dashboard
          </Typography>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardBody className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    error={!!formErrors.email}
                    color={formErrors.email ? 'red' : 'teal'}
                    className="pl-10"
                    disabled={isLoading}
                    containerProps={{
                      className: "min-w-0"
                    }}
                  />
                </div>
                {formErrors.email && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <Typography variant="small" color="red">
                      {formErrors.email}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    error={!!formErrors.password}
                    color={formErrors.password ? 'red' : 'teal'}
                    className="pl-10 pr-12"
                    disabled={isLoading}
                    containerProps={{
                      className: "min-w-0"
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <Typography variant="small" color="red">
                      {formErrors.password}
                    </Typography>
                  </div>
                )}
              </div>

              {/* General Error */}
              {formErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <Typography variant="small" color="red" className="font-medium">
                      {formErrors.general}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:from-teal-600 hover:to-teal-700 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <Link 
                  to="/doctor/fpassword" 
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-200">
                <Typography variant="small" color="gray" className="inline">
                  New to our platform? 
                </Typography>
                <Link 
                  to="/doctor/register" 
                  className="text-teal-600 hover:text-teal-700 font-semibold ml-1 transition-colors duration-200 hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <Typography variant="small" color="gray" className="text-xs flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Your data is protected 
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;