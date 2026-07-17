import React from "react";

const SimpleLoading = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-20">
      <div className="text-center">
        {/* Simple elegant spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Simple text */}
        <p className="text-gray-600 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default SimpleLoading;

