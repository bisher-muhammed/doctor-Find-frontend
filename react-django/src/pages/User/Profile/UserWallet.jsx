import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Wallet, Bell, RefreshCw, Eye, EyeOff, TrendingUp, Clock, User, AlertCircle, CheckCircle, Info } from 'lucide-react';

function UserWallet() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showBalance, setShowBalance] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');

    const fetchWalletAndNotifications = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/users/wallet_view/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setWallet(response.data.wallet);
            setNotifications(response.data.notifications || []);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('API Error:', err);
            setError('Failed to fetch wallet data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && baseURL) {
            fetchWalletAndNotifications();
        } else {
            setError('Authentication token or API URL not found. Please login again.');
            setLoading(false);
        }
    }, [baseURL, token]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWalletAndNotifications();
        setRefreshing(false);
    };

    const getNotificationIcon = (notification) => {
        // Check if notification text contains keywords to determine type
        const text = notification.text.toLowerCase();
        if (text.includes('received') || text.includes('credit') || text.includes('added')) {
            return <TrendingUp className="text-green-500" size={20} />;
        } else if (text.includes('sent') || text.includes('debit') || text.includes('paid') || text.includes('withdrawn')) {
            return <TrendingUp className="text-red-500 rotate-180" size={20} />;
        } else {
            return <Info className="text-blue-500" size={20} />;
        }
    };

    const getNotificationStyle = (notification) => {
        // Check if notification text contains keywords to determine type
        const text = notification.text.toLowerCase();
        if (text.includes('received') || text.includes('credit') || text.includes('added')) {
            return 'border-l-4 border-green-500 bg-green-50 hover:bg-green-100';
        } else if (text.includes('sent') || text.includes('debit') || text.includes('paid') || text.includes('withdrawn')) {
            return 'border-l-4 border-red-500 bg-red-50 hover:bg-red-100';
        } else {
            return 'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                        <span className="text-gray-700 font-medium">Loading your wallet...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {refreshing ? 'Retrying...' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    if (!wallet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No wallet data found</h2>
                    <p className="text-gray-600 mb-6">Unable to load your wallet information.</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Wallet className="text-blue-600" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm border transition-colors duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Main Wallet Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                                    <User className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">Welcome back,</p>
                                    <h2 className="text-white text-xl font-semibold">
                                        {wallet.user.username.charAt(0).toUpperCase() + wallet.user.username.slice(1)}
                                    </h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm">Last updated</p>
                                <p className="text-white text-sm">
                                    {new Date(wallet.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Current Balance</p>
                                <div className="flex items-center space-x-3">
                                    <span className="text-4xl font-bold text-gray-800">
                                        {showBalance ? `₹${parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹••••••'}
                                    </span>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-100 p-4 rounded-2xl">
                                <Wallet className="text-green-600" size={32} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="text-gray-500" size={16} />
                                    <span className="text-sm font-medium text-gray-700">Account Created</span>
                                </div>
                                <p className="text-gray-600">
                                    {new Date(wallet.created_at).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <RefreshCw className="text-gray-500" size={16} />
                                    <span className="text-sm font-medium text-gray-700">Last Activity</span>
                                </div>
                                <p className="text-gray-600">
                                    {new Date(wallet.updated_at).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                {notifications.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <Bell className="text-yellow-600" size={20} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {notifications.length} new
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={index}
                                        className={`${getNotificationStyle(notification)} rounded-xl p-4 transition-all duration-200 cursor-pointer`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {notification.text}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {new Date(notification.timestamp).toLocaleString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {/* Optional: Add amount display if your notifications include amount data */}
                                                    {notification.amount && notification.amount > 0 && (
                                                        <div className={`text-sm font-semibold ${
                                                            notification.text.toLowerCase().includes('received') || 
                                                            notification.text.toLowerCase().includes('credit') ? 
                                                            'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {notification.text.toLowerCase().includes('received') || 
                                                             notification.text.toLowerCase().includes('credit') ? '+' : '-'}₹{notification.amount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {notifications.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Bell className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No recent activity</h3>
                        <p className="text-gray-500">Your wallet activity will appear here when available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserWallet;