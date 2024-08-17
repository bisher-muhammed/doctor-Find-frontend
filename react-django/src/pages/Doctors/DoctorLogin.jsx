import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
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
      console.log('User is already authenticated. Redirecting...');
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
        console.log('Login successful', res.data);

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
        console.error(error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardBody>
          <Typography variant="h4" color="blue-gray" className="text-center mb-6">
            Doctor Login
          </Typography>
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <Input
                label="Email"
                type="email"
                name="email"
                error={!!emailError}
                color={emailError ? 'red' : 'blue'}
                className="w-full"
              />
              {emailError && (
                <Typography variant="small" color="red" className="mt-1">
                  {emailError}
                </Typography>
              )}
            </div>
            <div className="mb-4">
              <Input
                label="Password"
                type="password"
                name="password"
                error={!!passwordError}
                color={passwordError ? 'red' : 'blue'}
                className="w-full"
              />
              {passwordError && (
                <Typography variant="small" color="red" className="mt-1">
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
              className="bg-teal-500 text-white hover:bg-teal-600"
            >
              Login
            </Button>
          </form>
          <div>
          <Link to="/doctor/fpassword/"><span >Forgot password</span></Link><br />
          <span>Don't have an account?</span> <Link to="/doctor/register/"><span>| Sign up</span></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default DoctorLogin;
