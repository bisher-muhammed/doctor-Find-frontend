import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaWallet } from 'react-icons/fa'; // Importing wallet icon

function UserWallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const baseURL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('access');

    useEffect(() => {
        const fetchWalletAndNotifications = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/users/wallet_view/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setWallet(response.data.wallet);
                setNotifications(response.data.notifications);
            } catch (err) {
                setError('Failed to fetch wallet data');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletAndNotifications();
    }, [baseURL, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-fixed bg-white">
            {/* Notifications Section */}
            <div className="z-50 w-full py-6 flex justify-center">
                <div className="flex flex-col space-y-4 notifications-container">
                    {notifications.map((notification, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105 flex items-center"
                        >
                            <FaWallet size={24} className="mr-2" />
                            <div>
                                <span className="font-semibold text-red-500">{notification.text}</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    on {new Date(notification.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Wallet Details Section */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-sm md:max-w-md lg:max-w-lg mx-4 text-center relative">
                {/* Wallet Icon Background */}
                <div className="absolute inset-0 opacity-15 flex items-center justify-center" style={{ zIndex: 0 }}>
                    <FaWallet size={150} className="text-gray-300 dark:text-amber-500" />
                </div>

                {/* Wallet Content */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-xl font-semibold">
                            {wallet.user.username.charAt(0).toUpperCase() + wallet.user.username.slice(1)}'s Wallet
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                            {new Date(wallet.updated_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                            ₹{parseFloat(wallet.balance).toFixed(2)}
                        </div>
                        <p className="text-gray-500 dark:text-blue-100 mb-6">Current Balance</p>

                        <div className="w-full">
                            <div className="relative bg-white dark:bg-gray-50 p-4 rounded-lg mb-4 bg-opacity-10">
                                {/* Wallet Details Text */}
                                <h3 className="font-semibold mb-1 z-10 relative text-black">Wallet Details</h3>
                                <p className="z-10 relative text-zinc-950">
                                    Created At: {new Date(wallet.created_at).toLocaleString()}
                                </p>
                                <p className="z-10 relative text-zinc-950">
                                    Updated At: {new Date(wallet.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default UserWallet;


