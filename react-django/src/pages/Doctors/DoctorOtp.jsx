import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer, Bounce } from 'react-toastify'; // Import Bounce transition
import 'react-toastify/dist/ReactToastify.css'; // Ensure you import the styles
import { set_authentication } from '../../Redux/authenticationSlice';

function DoctorOtp() {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const inputRefs = useRef(Array.from({ length: 4 }, () => React.createRef()));
  const [seconds, setSeconds] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false); // Add resendDisabled state
  const baseURL = 'http://127.0.0.1:8000';
  const navigate = useNavigate();
  const registeredEmail = localStorage.getItem('registeredEmail');
  const dispatch = useDispatch();

  useEffect(() => {
    if (seconds > 0) {
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    } else {
      setOtpValues(['', '', '', '']); // Clear OTP fields when the timer reaches 0
      setResendDisabled(false); // Enable resend button when timer is up
    }
  }, [seconds]);

  const handleVerification = async (event) => {
    event.preventDefault();
    const enteredOtp = otpValues.join('');
    console.log('Entered OTP:', enteredOtp);
    console.log('Request payload:', { email: registeredEmail, otp: enteredOtp });

    try {
      const res = await axios.post(`${baseURL}/api/doctors/doctor/otpverify/`, {
        email: registeredEmail,
        otp: enteredOtp,
      });
      if (res.status === 200) {
        dispatch(set_authentication({
          isAuthenticated: true,
          isAdmin: false,
          isDoctor: true,
          token: res.data.token,
          name: res.data.username,
          userid: res.data.userid,
          isActive: true,
        }));

        console.log('Account verified successfully');
        navigate('/doctor/home');
        toast.success('Account verified successfully', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } else {
        console.log('Verification failed');
        toast.error('Verification failed', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      toast.error('Error during OTP verification', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const handleInputChange = (index, value) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value !== '' && index < otpValues.length - 1 && inputRefs.current[index + 1]?.current) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      await axios.post(`${baseURL}/api/doctors/doctor/resend_otp/`, {
        email: registeredEmail,
      });

      setSeconds(60);
      setResendDisabled(true);
      toast.success('OTP has been resent to your email.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error('Failed to resend OTP. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-600 p-4">
      <div className="w-full max-w-md mx-auto bg-slate-950 rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Email Verification</h2>
          <p className="mt-2 text-gray-600">Sent an OTP to your email {registeredEmail}</p>
        </div>
        <form onSubmit={handleVerification} className="px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-center gap-2 mb-6">
            {otpValues.map((value, index) => (
              <input
                key={index}
                type="text"
                name={`otp${index + 1}`}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center border rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                ref={inputRefs.current[index]}
                maxLength={1}
                pattern="[0-9]"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            ))}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Verify Account
            </button>
            <a
              href="#"
              onClick={handleResendOtp}
              className={`inline-block align-baseline font-bold text-sm text-teal-500 hover:text-teal-800 ml-4 ${resendDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={resendDisabled}
            >
              Resend OTP {seconds > 0 && `(${seconds}s)`}
            </a>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default DoctorOtp;
