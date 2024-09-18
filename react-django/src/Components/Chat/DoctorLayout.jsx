import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DoctorChatRoomList from '../../pages/Doctors/DoctorChatRoomList';
import DoctorChatMessage from '../../pages/Doctors/DoctorChatMessage';

function DoctorLayout() {
  const location = useLocation();

  // Decide when to show the chat rooms list as a sidebar
  const showSidebar = location.pathname.startsWith('/doctor/messages');

  return (
    <div className='flex h-screen bg-white'>
      {/* Sidebar with Chat Room List */}
      {showSidebar && (
        <div className="w-1/3 bg-white border-slate-700 p-4 shadow-md fixed h-full top-0 left-0">
          <div className="overflow-auto h-[calc(100vh-6rem)]">
            <DoctorChatRoomList />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${showSidebar ? 'ml-[33.33%]' : ''} flex flex-col`}>
        <Routes>
          {/* Separate Doctor Chat Room List */}
          <Route path="/doctor/chat_rooms" element={<DoctorChatRoomList />} />
          
          {/* Chat Messages with Sidebar */}
          <Route path="/doctor/messages/:roomId" element={<DoctorChatMessage />} />
        </Routes>
      </div>
    </div>
  );
}

export default DoctorLayout;
