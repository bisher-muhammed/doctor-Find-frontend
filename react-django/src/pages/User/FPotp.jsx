import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

function FPotp() {
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const inputRefs = useRef(Array.from({ length: 4 }, () => React.createRef()));
    const baseURL = 'http://127.0.0.1:8000';
    const navigate = useNavigate();
    const registeredEmail = localStorage.getItem('registeredEmail');
    const user_id = localStorage.getItem('user_id');
    console.log(registeredEmail);

    const handleVerification = async (e) => {
        e.preventDefault();
        const enteredOtp = otpValues.join('');
        console.log(enteredOtp);
        console.log('Request payload:', { email: registeredEmail, otp: enteredOtp });
        try {
            const res = await axios.post(baseURL + '/api/users/otpverify/', {
                email: registeredEmail,
                otp: enteredOtp,
            });

            if (res.status === 200) {
                console.log("Account created successfully");
                navigate(`/changePassword/${user_id}`);
                toast.success("Account created successfully");
            } else {
                console.log('Verification failed');
                toast.error('Verification failed');
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            toast.error('Error during OTP verification');
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-600 p-4">
            <div className="w-full max-w-md mx-auto bg-slate-950 rounded-lg shadow-md overflow-hidden">
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Email Verification</h2>
                    <p className="mt-2 text-gray-600">Sent an OTP to your email {registeredEmail}</p>
                </div>
                <form onSubmit={handleVerification} method="post" className="px-8 pt-6 pb-8 mb-4">
                    <div className="flex justify-center gap-2 mb-6">
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                name={`otp${index + 1}`}
                                value={value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
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
                            className="inline-block align-baseline font-bold text-sm text-teal-500 hover:text-teal-800 ml-4"
                            onClick={() => {/* Implement Resend OTP functionality here */}}
                        >
                            Resend OTP
                        </a>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default FPotp;
