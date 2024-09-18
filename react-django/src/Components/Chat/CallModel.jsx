import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CallModel({ callId, handleAcceptCall, handleDeclineCall }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onAcceptCall = () => {
    setLoading(true);
    handleAcceptCall(callId);
    setTimeout(() => navigate(`/Call/${callId}`), 500); // Redirect to call page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img src="/path/to/caller.jpg" alt="Caller" className="w-24 h-24 rounded-full object-cover" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Incoming Call</h2>
        <p className="text-gray-500 mb-6">Someone is calling you...</p>

        <div className="flex justify-evenly mt-6">
          <button
            onClick={onAcceptCall}
            className={`bg-green-500 text-white px-4 py-2 rounded-full ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            Accept
          </button>
          <button
            onClick={handleDeclineCall}
            className="bg-red-500 text-white px-4 py-2 rounded-full"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModel;
