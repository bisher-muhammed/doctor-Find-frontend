import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import { FaFile, FaMicrophone, FaPaperPlane, FaPlay, FaPause } from 'react-icons/fa';

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

const DoctorMessageInput = ({ roomId, socket, user, baseURL, token }) => {
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordedAudios, setRecordedAudios] = useState([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

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

  const handleSendMessage = useCallback(async () => {
    const formData = new FormData();
    
    // Add text content if available
    if (newMessage.trim() !== '') {
      formData.append('content', newMessage);
    }
    
    // Add the selected file if available
    if (file) {
      formData.append(fileType, file); // Image, video, or audio
    }
    
    // Add recorded audios if available
    recordedAudios.forEach((audio, index) => {
      formData.append('voice_message', audio, `recording_${index}.ogg`);
    });

    try {
      const response = await axios.post(
        `${baseURL}/api/doctors/doctor/chat_rooms/${roomId}/messages/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
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
        content: newMessage,
        image: response.data.image || null,
        video: response.data.video || null,
        voice_message: response.data.voice_message || null,
        sender: user.current,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, file, fileType, recordedAudios, roomId, token, socket, user, baseURL]);

  const handleCloseImagePreview = () => {
    setImagePreviewUrl(null);
  };
  
  const handleCloseVideoPreview = () => {
    setVideoPreviewUrl(null);
  };

  return (
    <>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows="2"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message"
          />
          <label className="flex items-center">
            <FaFile className="cursor-pointer text-xl text-gray-600 hover:text-gray-800 transition-colors" />
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-500'} text-white hover:opacity-80 transition-opacity`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            <FaMicrophone />
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
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
    </>
  );
};

export default DoctorMessageInput;