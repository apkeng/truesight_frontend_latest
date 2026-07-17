import React from "react";

const LoadingScreen = ({ message = "Loading...", subMessage = "Please wait while we prepare everything for you" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Cute animated loader */}
        <div className="relative mb-6">
          <div className="flex justify-center items-center space-x-2 mb-4">
            {/* Bouncing dots */}
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '0.6s' }}></div>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}></div>
          </div>
          
          {/* Spinning circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Pulsing center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 animate-pulse">
          {message}
        </h2>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          {subMessage}
        </p>
        
        {/* Progress bar animation */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-progress"></div>
        </div>
        
        {/* Cute emoji animation */}
        <div className="mt-6 text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
          ✨
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
            transform: translateX(0);
          }
          50% {
            width: 70%;
            transform: translateX(0);
          }
          100% {
            width: 100%;
            transform: translateX(0);
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

