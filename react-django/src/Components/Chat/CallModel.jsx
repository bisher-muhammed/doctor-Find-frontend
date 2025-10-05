import React from 'react';

function CallModel({ callId, handleAcceptCall, handleDeclineCall }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md animate-fade-in">
        <h2 className="text-lg font-semibold mb-4">Incoming Call (ID: {callId})</h2>
        <div className="flex justify-around">
          <button
            onClick={() => handleAcceptCall(callId)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            aria-label="Accept call"
          >
            Accept
          </button>
          <button
            onClick={() => handleDeclineCall(callId)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            aria-label="Decline call"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModel;




