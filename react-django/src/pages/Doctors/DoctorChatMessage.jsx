import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import { io } from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';
import { FaFile, FaMicrophone, FaPaperPlane, FaPlay, FaPause, FaImage, FaVideo } from 'react-icons/fa';
import UserHeader from '../../Components/Chat/UserHeader';

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
          <video ref={videoRef} src={videoUrl} controls className="w-full max-h-64 object-cover" />
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

const DoctorChatComponent = () => {
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
  const token = localStorage.getItem('access');
  const baseURL = 'http://127.0.0.1:8000';
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
      socket.current.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/doctors/doctor/chat_rooms/${roomId}/messages/`,  {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const newRecorder = new RecordRTC(stream, { type: 'audio' });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);
    }).catch((error) => console.error('Error accessing microphone:', error));
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
      if (selectedFile.type.startsWith('video')) {
        setVideoPreviewUrl(URL.createObjectURL(selectedFile));
      } else if (selectedFile.type.startsWith('image')) {
        setImagePreviewUrl(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSendMessage = useCallback( async () => {
    const formData = new FormData();

    if (newMessage.trim() !== '') {
      formData.append('content', newMessage);
    }

    if (file) {
      if (fileType === 'image') {
        formData.append('image', file);
      } else if (fileType === 'video') {
        formData.append('video', file);
      } else if (fileType === 'audio') {
        formData.append('voice_message', file);
      }
    }

    recordedAudios.forEach((audio, index) => {
      formData.append('voice_message', audio, `recording_${index}.ogg`); // Keep using 'voice_message'
    });

    if (newMessage.trim() === '' && !file && recordedAudios.length === 0) {
      console.error('Error: Please type a message or select a file/voice message.');
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/doctors/doctor/chat_rooms/${roomId}/send_message/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessage('');
      setFile(null);
      setFileType(null);
      setImagePreviewUrl(null);
      setVideoPreviewUrl(null);
      setRecordedAudios([]);
      socket.current.emit('send_message', {
        room_id: roomId,
        content: newMessage || '',
        image: response.data.image || null,
        video: response.data.video || null,
        voice_message: response.data.voice_message || null,
        sender_id: user.current,
      });
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  }, [newMessage, file, fileType, recordedAudios, roomId, token]);

  const handleCloseImagePreview = () => setImagePreviewUrl(null);
  const handleCloseVideoPreview = () => setVideoPreviewUrl(null);

  return (
    <div className="w-full h-screen relative flex flex-col mt-4">
      <UserHeader/>
    <h2 className="text-xl font-semibold"></h2>
      <div className="flex-1 overflow-x-auto p-4 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === user.current ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div className="p-2 rounded-lg">
  {/* Your message content here */}


  {message.content && (
  <p className={`flex ${message.sender === user.current ? 'bg-slate-800 px-2 text-white rounded-lg' : 'bg-slate-400 px-2 text-black rounded-lg'}`}>
    {message.content}
  </p>
)}

              {message.image && (
                <img
                  src={message.image}
                  alt="Sent Image"
                  className="max-w-xs h-auto object-cover cursor-pointer"
                  onClick={() => setImagePreviewUrl(message.image)}
                />
              )}
              {message.video && (
                <video
                  src={message.video}
                  controls
                  className="max-w-sm h-auto object-cover cursor-pointer"
                  onClick={() => setVideoPreviewUrl(message.video)}
                />
              )}
              {message.voice_message && (
                <audio controls className="w-48 rounded-lg">
                  <source src={message.voice_message} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="bg-zinc-100 p-4">
        {imagePreviewUrl && <ImagePreviewModal imageUrl={imagePreviewUrl} onClose={handleCloseImagePreview} />}
        {videoPreviewUrl && <VideoPreviewModal videoUrl={videoPreviewUrl} onClose={handleCloseVideoPreview} />}
        <div className="flex items-center space-x-4">
          {isRecording ? (
            <button onClick={handleStopRecording} className="text-red-500">
              <FaMicrophone className="h-6 w-6" />
            </button>
          ) : (
            <button onClick={handleStartRecording} className="text-teal-500">
              <FaMicrophone className="h-6 w-6" />
            </button>
          )}
          <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
          <label htmlFor="file-input">
            <FaFile className="h-6 w-6 text-gray-500 cursor-pointer" />
          </label>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === '' && !file && recordedAudios.length === 0}
            className="text-blue-500"
          >
            <FaPaperPlane className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorChatComponent;
