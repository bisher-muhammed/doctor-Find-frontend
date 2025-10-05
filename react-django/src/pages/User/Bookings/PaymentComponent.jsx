import React, { useState } from 'react';
import axios from 'axios';
import { loadRazorpayScript } from '../../../utils/razorpay';

const PaymentComponent = ({ transactionId }) => {
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL

    // API call to verify Razorpay payment
    const verifyPayment = async (paymentData) => {
        try {
            const response = await axios.post(
                `${baseURL}/api/users/verify-payment/`,
                paymentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            setError('Failed to verify payment.');
            throw error;
        }
    };

    const initiateRazorpayPayment = async () => {
        try {
            console.log('Initiating Razorpay payment...');
            // Ensure Razorpay SDK is loaded
            const res = await loadRazorpayScript();

            if (!res) {
                console.error('Razorpay SDK failed to load. Check your internet connection.');
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // Request payment order details from your backend
            const response = await axios.post(
                `${baseURL}/api/users/book-slot/${transactionId}/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const { razorpay_order_id, amount } = response.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay API Key ID
                amount: amount.toString(), // Amount in paise (e.g., ₹500.00 -> 50000)
                currency: 'INR',
                order_id: razorpay_order_id, // Order ID returned by your backend
                handler: async function (response) {
                    try {
                        const verifyResponse = await verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verifyResponse.status === 'success') {
                            handleRazorpaySuccess();
                        } else {
                            handleRazorpayFailure();
                        }
                    } catch (err) {
                        console.error('Error during payment verification:', err);
                        handleRazorpayFailure();
                    }
                },
                prefill: {
                    name: 'Customer Name', // Prefill customer name
                    email: 'customer@example.com', // Prefill customer email
                    contact: '9999999999', // Prefill customer contact
                },
                notes: {
                    address: 'Shop Address', // Additional notes (optional)
                },
                theme: {
                    color: '#3399cc', // Razorpay theme color
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Error initiating Razorpay payment:', error);
            setError('Failed to initiate Razorpay payment.');
        }
    };

    const handleRazorpaySuccess = () => {
        // Logic to handle successful payment
        alert('Payment Successful!');
    };

    const handleRazorpayFailure = () => {
        // Logic to handle failed payment
        alert('Payment Failed. Please try again.');
    };

    return (
        <div>
            {error && <p className="text-red-500">{error}</p>}
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={initiateRazorpayPayment}
            >
                Pay with Razorpay
            </button>
        </div>
    );
};

export default PaymentComponent;
