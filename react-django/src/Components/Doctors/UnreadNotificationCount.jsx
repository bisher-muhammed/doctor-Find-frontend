import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Badge } from '@mui/material';

const UnreadNotificationCount = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const token = localStorage.getItem('access'); // Retrieve the token from localStorage
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                // Ensure this matches your Django view's endpoint
                const response = await axios.get(`${baseURL}/api/doctors/doctor/notification/unread-count/`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Add token to Authorization header
                    }
                });
                setUnreadCount(response.data.unread_count); // Set the unread count from response
            } catch (error) {
                console.error("Error fetching unread notifications count:", error);
            }
        };

        fetchUnreadCount(); // Fetch unread notifications count when the component mounts
    }, [token]); // Dependency array to re-run when token changes

    return (
        <div>
            <Typography variant="h6">
                <Badge color="secondary" badgeContent={unreadCount}>
                    {/* Add an icon or text here, e.g., bell icon */}
                    
                </Badge>
            </Typography>
        </div>
    );
};

export default UnreadNotificationCount;
