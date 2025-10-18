import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaCalendarCheck, FaClock, FaUserMd, FaArrowRight } from 'react-icons/fa';
import { MdCelebration, MdOutlineDownload } from 'react-icons/md';

const PaymentSuccessMessage = ({ 
  onClose, 
  doctorName, 
  appointmentDate, 
  appointmentTime,
  bookingId,
  showDownloadOption = true 
}) => {
  const [countdown, setCountdown] = useState(5);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Confetti effect
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    // Countdown for auto-redirect
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(confettiTimer);
      clearInterval(countdownInterval);
    };
  }, [onClose]);

  const handleDownloadReceipt = () => {
    // Simulate receipt download
    console.log('Downloading receipt for booking:', bookingId);
    // In real implementation, this would generate and download a PDF receipt
    alert('Receipt download started!');
  };

  const ConfettiEffect = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-10 h-10 text-white animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-green-100 opacity-90">Your appointment has been successfully scheduled</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Celebration Icon */}
            <div className="flex justify-center mb-4">
              <MdCelebration className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 mb-6">
              {doctorName && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FaUserMd className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-semibold text-gray-800">{doctorName}</p>
                  </div>
                </div>
              )}

              {appointmentDate && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <FaCalendarCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-800">{appointmentDate}</p>
                  </div>
                </div>
              )}

              {appointmentTime && (
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <FaClock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-800">{appointmentTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking ID */}
            {bookingId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="font-mono font-bold text-gray-800 text-lg">{bookingId}</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                <FaArrowRight className="w-4 h-4 mr-2" />
                What's Next?
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Join the meeting 5 minutes before scheduled time</li>
                <li>• Bring your medical reports if any</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {showDownloadOption && (
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  <MdOutlineDownload className="w-5 h-5" />
                  <span>Receipt</span>
                </button>
              )}
              
              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View Appointments ({countdown})
              </button>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Automatically redirecting in {countdown} seconds...
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

// Default props for backward compatibility
PaymentSuccessMessage.defaultProps = {
  doctorName: '',
  appointmentDate: '',
  appointmentTime: '',
  bookingId: '',
  showDownloadOption: true,
  onClose: () => {}
};

export default PaymentSuccessMessage;
