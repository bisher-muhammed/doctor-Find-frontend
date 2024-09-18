import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';  // Import socket.io-client

const socket = io.connect('http://localhost:8000');  // Update with your server URL

const UserCall = () => {
    const { roomId } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [profile, setProfile] = useState(null);

    let user = null;
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            user = decodedToken.user_id?.toString();
        } catch (error) {
            console.error("Invalid token:", error);
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch user profile data
                const response = await fetch('/api/user-profile');  // Adjust URL as needed
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching user profile data:", error);
            }
        };
        fetchProfile();
    }, [token]);

    useEffect(() => {
        if (!containerRef.current || !profile || isRoomJoined) return;

        const joinMeeting = async () => {
            const appId = 827751106;
            const serverSecret = "ae15619cffa26b4920a5375c946575c0";
            const username = profile?.username || "Default Shop Name";
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId,
                serverSecret,
                roomId,
                user,
                username
            );
            const zc = ZegoUIKitPrebuilt.create(kitToken);
            zc.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showScreenSharingButton: false,
                showPreJoinView: false,
                turnOnCameraWhenJoining: false,
                turnOnMicrophoneWhenJoining: true,
                showLeaveRoomConfirmDialog: false,
                onLeaveRoom: () => navigate('/ChatMessage'),
                onUserLeave: () => navigate('/ChatMessage'),
            });
            setIsRoomJoined(true);
        };
        joinMeeting();

        return () => {
            setIsRoomJoined(false);
        };
    }, [roomId, user, profile]);

    useEffect(() => {
        const handleAudioMessage = (data) => {
            if (data.content === "Calling") {
                setCallId(data.callId);
                setShowModal(true);
            }
            if (data.content === "call_declined") {
                alert("The call was declined.");
                setShowModal(false);
            }
        };

        socket.on("receive_message", handleAudioMessage);

        return () => {
            socket.off("receive_message", handleAudioMessage);
        };
    }, [user]);

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <div ref={containerRef} style={{ height: '100vh', width: '100vw' }} />
        </div>
    );
}

export default UserCall;





