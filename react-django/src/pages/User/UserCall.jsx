import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://127.0.0.1:8000';
const APP_ID = 827751106; 
const SERVER_SECRET = "ae15619cffa26b4920a5375c946575c0"; 

const UserCall = () => {
    const { roomId } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("Default User");
    const [isInCall, setIsInCall] = useState(false);
    
    const zegoInstance = useRef(null); 

    const decodeToken = () => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken?.user_id?.toString());
                setUsername(decodedToken?.username || "Default");
            } catch (error) {
                console.error("Invalid token:", token);
            }
        }
    };

    useEffect(() => {
        decodeToken();
    }, [token]);

    useEffect(() => {
        const joinMeeting = async () => {
            // Only attempt to join if not already in a call
            if (isInCall || !containerRef.current || !user || !username) return;
    
            try {
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    APP_ID,
                    SERVER_SECRET,
                    roomId,
                    user,
                    username
                );
    
                // Prevent multiple instances
                if (zegoInstance.current) {
                    console.warn("Already in a call. Ignoring join request.");
                    return; // Prevent rejoining if already in a call
                }
    
                const zc = ZegoUIKitPrebuilt.create(kitToken);
                await zc.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showScreenSharingButton: false,
                    showPreJoinView: false,
                    turnOnCameraWhenJoining: false,
                    turnOnMicrophoneWhenJoining: true,
                    showLeaveRoomConfirmDialog: false,
                    onLeaveRoom: () => {
                        console.log('User left the room');
                        setIsInCall(false); // Update state when leaving the room
                        navigate(`/chats/${roomId}`); // Navigate after leaving
                    },
                    onUserLeave: () => navigate(`/chats/${roomId}`),
                });
    
                zegoInstance.current = zc; // Save zego instance
                setIsInCall(true); // Set in-call state
            } catch (error) {
                console.error("Error joining meeting:", error);
            }
        };
    
        joinMeeting(); // Call to join meeting
    
        return () => {
            console.log('Leaving room');
            if (zegoInstance.current) {
                zegoInstance.current.leave(); // Leave room on unmount
                zegoInstance.current = null; // Reset instance on leave
                setIsInCall(false); // Reset the in-call state
            }
        };
    }, [roomId, user, username]); // Removed isInCall from the dependency array

    useEffect(() => {
        const socket = io(SOCKET_URL);

        const handleAudioMessage = (data) => {
            console.log("Received message:", data);
            if (data.content === "Calling") {
                if (!isInCall) {
                    alert("Incoming call...");
                }
            } else if (data.content === "call_declined") {
                alert("The call was declined.");
            }
        };

        socket.on("receive_message", handleAudioMessage);

        return () => {
            socket.off("receive_message", handleAudioMessage);
            socket.disconnect();
        };
    }, [isInCall]);

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <div ref={containerRef} style={{ height: '100vh', width: '100vw' }} />
        </div>
    );
};

export default UserCall;

