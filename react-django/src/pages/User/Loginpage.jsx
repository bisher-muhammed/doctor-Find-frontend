import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { set_authentication } from '../../Redux/authenticationSlice';
import { ToastContainer,toast } from 'react-toastify';
import login from '../../assets/login.jpg'


function Loginpage() {
  const [formError, setFormError] = useState([]);
  const [message, setMessage] = useState(null);
  const baseURL = 'http://127.0.0.1:8000';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const authentication_user = useSelector(state => state.authUser);
  console.log('auth admin', authentication_user.isAdmin);
  console.log('name', authentication_user.name);

  useEffect(() => {
    if (authentication_user.isAuthenticated && authentication_user.isUser && !authentication_user.isAdmin && !authentication_user.isDoctor) {
      console.log('authenticated user');
      navigate('/home');
    }
  }, [authentication_user.isAuthenticated, authentication_user.isAdmin, authentication_user.isDoctor, navigate]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLoginError('');

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
      const res = await axios.post(`${baseURL}/api/users/login/`, formData);
      console.log('Response', res);
      if (res.status === 200) {
        console.log(res.data);
        console.log(jwtDecode(res.data.access_token).username);
        console.log('user login success');
        toast.success('Logged in successfully');
        localStorage.setItem('access', res.data.access_token);
        localStorage.setItem('refresh', res.data.refresh_token);
        localStorage.setItem('userid', res.data.userid);

        dispatch(
          set_authentication({
            name: jwtDecode(res.data.access_token).username,
            isAuthenticated: true,
            isUser:true,
            userid: res.data.userid,
            isAdmin: false,
            isDoctor: false,
          })
        );

        navigate('/home');
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        toast.error('Invalid credentials');
        setFormError(error.response.data);
      } else {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <div className="main-h-screen flex ">
        <div className="w-1/2 flex items-center justify-center bg-teal-200 relative">
        <div className="relative w-full h-full"></div>
        <img src={login} alt="Description" className="absolute inset-0 w-full h-full" />
        </div>
        <div className="w-1/2 flex-auto items-center justify-center-bg-slate-200">
          <div className="max-w-mid w-full bg-yello-400 shadow-md rounded-lg p-8">
            <form onSubmit={handleLoginSubmit}>
              <h1 className="text-gray-800 font-bold text-2xl mb-1">Hello</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-8">Welcome</h2>
              <div className="mb-4">
                <label htmlFor="email" className="block text-black text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="shadow appearance-none border rounded-xl w-full py-2 px-3 bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                {emailError && <span className="text-md text-red-800 mt-1 mb-5">{emailError}</span>}
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-black text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="shadow appearance-none border rounded-xl w-full py-2 px-3 bg-black text-gray-300 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {passwordError ? (
                <span className="text-md text-red-800">{passwordError}</span>
              ) : (
                loginError && <span className="text-md text-red-800">{loginError}</span>
              )}
              <div className="flex items-center justify-between">
                <button type="submit" className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline">
                  Login
                </button>
              </div>
            </form>
            <Link to="/fpassword"><span>Forgot password</span></Link><br />
            <span>Don't have an account?</span> <Link to="/signup"><span>| Sign up</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;