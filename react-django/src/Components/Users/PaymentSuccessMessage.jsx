import React from 'react';
import { FaCheckCircle } from 'react-icons/fa'

const PaymentSuccessMessage = () => {
    return (
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            {/* Icon */}
            <FaCheckCircle className="w-12 h-12 text-green-500 animate-pulse" />

            {/* Message */}
            <p className="text-center text-green-600 font-semibold text-xl">
                Payment successful! Redirecting to your appointments...
            </p>
        </div>
    );
};

export default PaymentSuccessMessage;