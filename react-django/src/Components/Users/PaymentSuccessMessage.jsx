import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccessMessage = ({ onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                <FaCheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
                <p className="text-center text-green-600 font-semibold text-xl">
                    Payment successful! Redirecting to your appointments...
                </p>
                <button onClick={onClose} className="mt-4 text-blue-500 hover:underline">
                    Close
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessMessage;
