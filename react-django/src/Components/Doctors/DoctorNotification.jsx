import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import moment from 'moment-timezone'; // Import moment-timezone for timezone handling
import { Button, List, ListItem, ListItemText, Typography, Divider, CircularProgress } from '@mui/material';

function DoctorNotification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('access'); // Get the token from localStorage
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL
    const socket = useRef(null); // Use useRef for the socket

    let doctorId;
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            doctorId = decodedToken.user_id; // Adjust this based on your token structure
            console.log("Decoded doctor ID:", doctorId); // Log the decoded doctor ID
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true); // Set loading to true when starting the request
                console.log("Fetching initial notifications..."); // Log before making the API call
                const response = await axios.get(`${baseURL}/api/doctors/doctor/notification/`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Add token to Authorization header
                    }
                });
                console.log("Initial notifications fetched:", response.data); // Log the response data
                setNotifications(response.data); // Update notifications from the response
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false); // Always set loading to false when done
            }
        };

        fetchNotifications(); // Fetch the existing notifications

        // Initialize socket connection
        socket.current = io(baseURL, { transports: ['websocket'] }); // Initialize Socket.IO client
        console.log("Socket initialized"); // Log socket initialization

        // Join the specific room for the doctor
        socket.current.on('connect', () => {
            if (doctorId) {
                // Emit to join the doctor's room
                socket.current.emit('join_room', { room_id: `doctor_${doctorId}` });
                console.log(`Joined room: doctor_${doctorId}`); // Log joining the room
            }
        });

        // Listen for incoming notifications via Socket.IO
        socket.current.on('receive_notification', (data) => {
            console.log("New notification received via socket:", data); // Log received notification
            // Update notifications with the new notification received
            setNotifications(prevNotifications => [
                ...prevNotifications,
                {
                    id: data.id, // Ensure that the new notification includes an ID
                    message: data.message,
                    slot_start: data.slot_start,
                    slot_end: data.slot_end,
                    created_at: data.timestamp,
                    is_read: false,  // Assuming the new notification is unread
                }
            ]);
        });

        // Cleanup function to disconnect socket on component unmount
        return () => {
            if (socket.current) {
                console.log("Disconnecting socket..."); // Log before disconnecting
                socket.current.disconnect();
            }
        };
    }, [token, doctorId]); // Include doctorId in dependency array

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`${baseURL}/api/doctors/doctor/notification/${notificationId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Add token to Authorization header
                }
            });
            // Update local notifications state
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId ? { ...notification, is_read: true } : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const clearNotifications = async () => {
        try {
            await axios.delete(`${baseURL}/api/doctors/doctor/notification/`, {
                headers: {
                    Authorization: `Bearer ${token}` // Add token to Authorization header
                }
            }); // Assuming you have an endpoint to clear all notifications
            setNotifications([]); // Clear notifications from state
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    if (loading) {
        return <CircularProgress />; // Show loading spinner
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Doctor Notifications
            </Typography>

            <Button variant="contained" color="secondary" onClick={clearNotifications} style={{ marginBottom: '20px' }}>
                Clear All Notifications
            </Button>

            <List>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.id}>
                            <ListItem>
                                <ListItemText
                                    primary={notification.message}
                                    secondary={
                                        <>
                                            {notification.slot_start && notification.slot_end && (
                                                <span>
                                                    <strong>Slot:</strong> 
                                                    {`${moment(notification.slot_start).tz('Asia/Kolkata').format('h:mm A')} - ${moment(notification.slot_end).tz('Asia/Kolkata').format('h:mm A')}`}
                                                </span>
                                            )}
                                            <br />
                                            <strong>Date:</strong> {moment(notification.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD')}
                                            <br />
                                            <strong>Amount:</strong> ₹{notification.amount || '200.00'} {/* Assuming you have an amount field */}
                                            <br />
                                            <strong>Status:</strong> {notification.is_read ? "Read" : "Unread"}
                                        </>
                                    }
                                />
                                {!notification.is_read && (
                                    <Button variant="outlined" color="primary" onClick={() => markAsRead(notification.id)}>
                                        Mark as Read
                                    </Button>
                                )}
                            </ListItem>
                            <Divider />
                        </div>
                    ))
                ) : (
                    <Typography variant="body1">No notifications found.</Typography>
                )}
            </List>
        </div>
    );
}

export default DoctorNotification;
