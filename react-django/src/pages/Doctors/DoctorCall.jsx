import React,{useEffect,useRef,useState} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import {jwtDecode} from 'jwt-decode'; // Corrected import for jwt-decode
import { io } from 'socket.io-client';
const DoctorCall = () =>{
    const {roomId} = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('access')

    const [isRoomJoined,setIsRoomJoined] = useState(false)
    const [user,setUser] = useState(null);
    const [username,setUsername] = useState("Default user")

    useEffect(()=>{
        if(token) {
            try{
                const decodedToken = jwtDecode(token)
                setUser(decodedToken?.user_id?.toString())
                setUsername(decodedToken?.username||"Default")

            }catch(error) {
                console.error("invalid token:",token)
                
            }
        }
    },[token])

    useEffect(() => {
        if (!containerRef.current || isRoomJoined || !user || !username) return;

        const joinMeeting = async () => {
            const appId = 827751106; // Use your actual App ID
            const serverSecret = "ae15619cffa26b4920a5375c946575c0"; // Use your actual Server Secret
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
                onLeaveRoom: () => navigate('/chats/roomId'),
                onUserLeave: () => navigate('/chats/roomId'),
            });

            setIsRoomJoined(true);
        };

        joinMeeting();

        return () => {
            console.log('Leaving room');
            setIsRoomJoined(false);
        };
    }, [roomId, user, username]); // Ensure username is included

    // Handle incoming call messages (socket setup)
    useEffect(() => {
        const handleAudioMessage = (data) => {
            if (data.content === "Calling") {
                alert("Incoming call...");
            }
            if (data.content === "call_declined") {
                alert("The call was declined.");
            }
        };

        // Initialize socket connection (replace with your actual socket server URL)
        const socket = io('http://127.0.0.1:8000');
        socket.on("receive_message", handleAudioMessage);

        return () => {
            socket.off("receive_message", handleAudioMessage);
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ height: '100vh', width: '100vw', backgroundColor: 'grey' }}>
            <div ref={containerRef} style={{ height: '100vh', width: '100vw', backgroundColor: 'lightgrey' }} />
        </div>
    );
};

export default DoctorCall;


