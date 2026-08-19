import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faHome, faRedo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({ 
  title = "Oops! Something went wrong", 
  message = "We encountered an error while processing your request.",
  error = null,
  onRetry = null,
  showHomeButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center bg-white   p-8 md:p-12 max-w-lg w-full">
        {/* Animated error icon */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="text-4xl md:text-5xl text-red-600 animate-pulse" 
            />
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-300 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Error content */}
        <h1 className="text-2xl md:text-3xl font-bold text-ink mb-3">
          {title}
        </h1>
        <p className="text-ink-muted mb-4 text-sm md:text-base">
          {message}
        </p>
        
        {/* Error details (if provided) */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left rounded">
            <p className="text-sm text-red-800 font-medium">Error Details:</p>
            <p className="text-xs text-red-600 mt-1 break-words">
              {typeof error === 'string' ? error : error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-navy hover:bg-navy-dark text-white font-semibold  transition-all duration-200  hover:shadow-lg transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faRedo} />
              <span>Try Again</span>
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={() => {
                const uid = document.cookie.split('; ').find(row => row.startsWith('uid='));
                if (uid) {
                  const role = localStorage.getItem('userRole') || 'l1dashboard';
                  navigate(`/${role}`);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold  transition-all duration-200  hover:shadow-lg transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Go Home</span>
            </button>
          )}
        </div>

        {/* Cute emoji */}
        <div className="mt-6 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>
          😔
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

