import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { jwtDecode } from 'jwt-decode'; // Corrected import for jwt-decode
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://127.0.0.1:8000';
const APP_ID = 1326632699;
const SERVER_SECRET = "4ec34b51aabd8692ad7ef9c0f2ca551e";

const DoctorCall = () => {
    const { roomId } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("Default User");
    const [isInCall, setIsInCall] = useState(false);

    const zegoInstance = useRef(null);

    // Decode the JWT token to retrieve user info
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
            if (!containerRef.current || !user || !username) return;

            try {
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    APP_ID,
                    SERVER_SECRET,
                    roomId,
                    user,
                    username
                );

                if (zegoInstance.current) {
                    console.warn("Already in a call. Ignoring join request.");
                    return;
                }

                const zc = ZegoUIKitPrebuilt.create(kitToken);
                await zc.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showScreenSharingButton: false,
                    showPreJoinView: false,  // Disable pre-join view
                    turnOnCameraWhenJoining: true, // Ensure camera is turned on
                    turnOnMicrophoneWhenJoining: true, // Ensure microphone is turned on
                    showLeaveRoomConfirmDialog: false, // Disable leave confirmation dialog
                    onLeaveRoom: () => {
                        console.log('Doctor left the room');
                        setIsInCall(false); // Reset call state when leaving
                        navigate(`/doctor/messages/${roomId}`); // Navigate back to chat page
                    },
                    onUserLeave: () => navigate(`/doctor/messages/${roomId}`), // If the other user leaves
                });

                zegoInstance.current = zc; // Save instance
                setIsInCall(true); // Mark the doctor as in call
            } catch (error) {
                console.error("Error joining meeting:", error);
            }
        };

        joinMeeting();

        return () => {
            // Clean up on component unmount
            if (zegoInstance.current) {
                zegoInstance.current.destroy(); // Destroy the Zego instance
                zegoInstance.current = null; // Reset instance
                setIsInCall(false); // Reset call state
            }
        };
    }, [roomId, user, username]);

    

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            {/* Container for video and audio feed */}
            <div ref={containerRef} style={{ height: '100vh', width: '100vw' }} />
        </div>
    );
};

export default DoctorCall;


