import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  
import { useDispatch, useSelector } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';
import { toast } from 'react-toastify';

import {
  Button,
  Card,
  CardBody,
  Input,
  Typography,
} from '@material-tailwind/react';

function DoctorLogin() {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const baseURL = 'http://127.0.0.1:8000';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authUser);

  useEffect(() => {
    if (authentication_user.isAuthenticated && authentication_user.isDoctor) {
      navigate('/doctor/home');
    }
  }, [authentication_user.isAuthenticated, authentication_user.isDoctor, navigate]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setFormError('');

    const email = event.target.email.value;
    const password = event.target.password.value;

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length > 0 && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await axios.post(`${baseURL}/api/doctors/doctor/login/`, formData);
      const verified = res.data.isEmailVerified;
      
      if (res.status === 200) {
        toast.success('Logged in successfully!');

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
      if (error.response && error.response.status === 401) {
        toast.error('Invalid credentials');
        setFormError('Invalid email or password');
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-teal-100 to-gray-50">
      <Card className="w-full max-w-lg shadow-xl rounded-lg overflow-hidden">
        <CardBody className="p-8">
          <Typography variant="h3" color="blue-gray" className="text-center font-semibold mb-6">
            Doctor Login
          </Typography>
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-5">
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                error={!!emailError}
                color={emailError ? 'red' : 'teal'}
                className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
              {emailError && (
                <Typography variant="small" color="red" className="mt-2">
                  {emailError}
                </Typography>
              )}
            </div>
            <div className="mb-5">
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                error={!!passwordError}
                color={passwordError ? 'red' : 'teal'}
                className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
              {passwordError && (
                <Typography variant="small" color="red" className="mt-2">
                  {passwordError}
                </Typography>
              )}
            </div>
            {formError && (
              <Typography variant="small" color="red" className="mb-4 text-center">
                {formError}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              className="bg-teal-500 text-white font-semibold hover:bg-teal-600 py-3 rounded-lg"
            >
              Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/doctor/fpassword" className="text-teal-500 hover:underline">
              Forgot password?
            </Link>
            <div className="mt-2">
              <span className="text-gray-500">Don't have an account?</span>{' '}
              <Link to="/doctor/register" className="text-teal-500 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default DoctorLogin;
