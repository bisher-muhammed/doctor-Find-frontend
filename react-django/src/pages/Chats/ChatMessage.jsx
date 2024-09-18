import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import DoctorHeader from './DoctorHeader';
import { FaFile, FaMicrophone, FaFileAudio, FaFileVideo, FaPlay, FaPause, FaPaperPlane } from 'react-icons/fa';
import { io } from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';

// Modal components
const ImagePreviewModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <img src={imageUrl} alt="Preview" className="w-full h-auto object-cover" />
      </div>
    </div>
  );
};

const VideoPreviewModal = ({ videoUrl, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [isPlaying]);

  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div className="relative w-full h-auto">
          <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordedAudios, setRecordedAudios] = useState([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const scrollRef = useRef(null);
  const socket = useRef(null);
  const user = useRef(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        user.current = decodedToken.user_id;
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!roomId || !user.current) return;

    socket.current = io(baseURL, { transports: ['websocket'] });

    socket.current.on('connect', () => {
      socket.current.emit('join_room', { room_id: roomId, user_id: user.current });
    });

    socket.current.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/chats/chat_rooms/${roomId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  const handleStartRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const newRecorder = new RecordRTC(stream, { type: 'audio' });
        newRecorder.startRecording();
        setRecorder(newRecorder);
        setIsRecording(true);
      })
      .catch((error) => console.error('Error accessing microphone:', error));
  };

  const handleStopRecording = () => {
    if (recorder) {
      recorder.stopRecording(() => {
        const audioBlob = recorder.getBlob();
        setRecordedAudios((prev) => [...prev, audioBlob]);
        setIsRecording(false);
      });
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(selectedFile.type.split('/')[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (selectedFile.type.startsWith('video')) {
          setVideoPreviewUrl(URL.createObjectURL(selectedFile));
        } else if (selectedFile.type.startsWith('image')) {
          setImagePreviewUrl(URL.createObjectURL(selectedFile));
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSendMessage = useCallback( async () => {
    const formData = new FormData();
    
    // Add text content if available
    if (newMessage.trim() !== '') {
      formData.append('content', newMessage);
    }
    
    // Add the selected file if available
    if (file) {
      if (fileType === 'image') {
        formData.append('image', file);
      } else if (fileType === 'video') {
        formData.append('video', file);
      } else if (fileType === 'audio') {
        formData.append('voice_message', file); // Consistently using 'voice_message'
      }
    }
    
    // Add recorded audios if available
    recordedAudios.forEach((audio, index) => {
      formData.append('voice_message', audio, `recording_${index}.ogg`); // Keep using 'voice_message'
    });
  
    try {
      const response = await axios.post(`${baseURL}/api/chats/chat_rooms/${roomId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      // Clear form state after sending
      setNewMessage('');
      setFile(null);
      setFileType(null);
      setImagePreviewUrl(null);
      setVideoPreviewUrl(null);
      setRecordedAudios([]);
      // Emit message to socket
      socket.current.emit('send_message', {
        room_id: roomId,
        content: newMessage || '', // Fallback if no text message is provided
        image: response.data.image||null,
        video: response.data.video||null,
        voice_message: response.data.voice_message || null, // Use the voice message URL from the response
        sender_id: user.current,
      });
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  },[token,newMessage, file, fileType, recordedAudios, baseURL, token]);

  const handleCloseImagePreview = () => {
    setImagePreviewUrl(null);
  };

  const handleCloseVideoPreview = () => {
    setVideoPreviewUrl(null);
  };

  return (
    <div className="w-full h-screen relative flex flex-col mt-4">
      <DoctorHeader />
      <h2 className="text-xl font-semibold"></h2>

      <div className="flex-1 overflow-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === user.current ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`flex flex-col max-w-xs ${message.sender === user.current ? 'items-end' : 'items-start'}`}>
              {message.image && (
                <div className="relative">
                  <img
                    src={message.image}
                    alt="message"
                    className="w-48 h-auto rounded-lg cursor-pointer"
                    onClick={() => setImagePreviewUrl(message.image)}
                  />
                </div>
              )}
              {message.video && (
                <div className="relative">
                  <video
                    src={message.video}
                    controls
                    className="w-48 h-auto rounded-lg cursor-pointer"
                    onClick={() => setVideoPreviewUrl(message.video)}
                  />
                </div>
              )}
              {message.voice_message && (
                <audio controls className="w-48 rounded-lg">
                  <source src={message.voice_message} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              {message.voice_recordings &&
                message.voice_recordings.map((audioUrl, idx) => (
                  <audio key={idx} controls className="w-48 rounded-lg">
                    <source src={audioUrl} type="audio/ogg" />
                    Your browser does not support the audio element.
                  </audio>
                ))}
              {!message.image &&
                !message.video &&
                !message.voice_message &&
                !message.voice_recordings && (
                  <p className="bg-gray-200 p-2 rounded-lg text-gray-800">
                    {message.content}
                  </p>
                )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white">
        <div className="flex space-x-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows="2"
            className="w-full border border-gray-300 p-2 rounded-lg"
            placeholder="Type a message"
          />
          <label className="flex items-center">
            <FaFile className="cursor-pointer text-xl" />
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            className={`px-2 ${isRecording ? 'bg-red-500' : 'bg-gray-500'} text-white`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            <FaMicrophone />
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-sm"
            onClick={handleSendMessage}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {imagePreviewUrl && (
        <ImagePreviewModal imageUrl={imagePreviewUrl} onClose={handleCloseImagePreview} />
      )}
      {videoPreviewUrl && (
        <VideoPreviewModal videoUrl={videoPreviewUrl} onClose={handleCloseVideoPreview} />
      )}
    </div>
  );
};

export default ChatMessage;

