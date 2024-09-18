import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ChatRoomList from './ChatRoomList';
import ChatMessage from './ChatMessage';

const ChatLayout = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-slate-700 p-4 shadow-md fixed h-full top-0 left-0">
        
        <div className="overflow-auto h-[calc(100vh-6rem)]">
          <ChatRoomList />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 ml-[33.33%] flex flex-col">
        <Routes>
          <Route path="/chatrooms" element={<ChatRoomList />} />
          <Route path="/chats/:roomId" element={<ChatMessage />} />
        </Routes>
      </div>
    </div>
  );
};

export default ChatLayout;
