import React from "react";

/**
 * Premium Loading Component with Scientific-themed animation
 */
const Loading = ({ 
  message = "Syncing curriculum data...", 
  fullScreen = false,
  size = 'md'
}) => {
  const sizeMap = {
    sm: { container: 'w-16 h-16', orb1: 'w-10 h-10', orb2: 'w-6 h-6', orb3: 'w-3 h-3', text: 'text-[9px]' },
    md: { container: 'w-24 h-24', orb1: 'w-16 h-16', orb2: 'w-10 h-10', orb3: 'w-5 h-5', text: 'text-[11px]' },
    lg: { container: 'w-40 h-40', orb1: 'w-24 h-24', orb2: 'w-14 h-14', orb3: 'w-7 h-7', text: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${currentSize.container} mb-8 flex items-center justify-center`}>
        {/* Orbiting Ring 1 - Deep Blue */}
        <div className={`absolute ${currentSize.orb1} border-4 border-t-blue-600 border-r-transparent border-b-blue-600/10 border-l-transparent rounded-full animate-spin duration-[2s] shadow-lg shadow-blue-100`}></div>
        
        {/* Orbiting Ring 2 - Indigo */}
        <div className={`absolute ${currentSize.orb2} border-4 border-t-transparent border-r-indigo-600 border-b-transparent border-l-indigo-600/10 rounded-full animate-spin-reverse duration-[1.5s]`}></div>
        
        {/* Central Core - Violet */}
        <div className={`absolute ${currentSize.orb3} bg-gradient-to-br from-violet-600 to-purple-800 rounded-full animate-pulse shadow-xl shadow-purple-200`}></div>

        {/* Floating knowledge particles */}
        <div className="absolute inset-0">
           <div className="absolute top-0 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-20" />
           <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-indigo-400 rounded-full animate-ping delay-300 opacity-20" />
           <div className="absolute top-1/2 -left-2 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-700 opacity-20" />
        </div>
      </div>
      
      {/* Loading text with refined typography */}
      {message && (
        <div className="text-center">
          <p className={`font-black uppercase tracking-[0.3em] text-slate-800 ${currentSize.text} animate-pulse px-4`}>
            {message}
          </p>
          <div className="mt-2 flex justify-center gap-1">
             <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute -inset-24 bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute -inset-12 bg-purple-400/5 rounded-full blur-3xl delay-700" />
          
          <div className="relative bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-12 md:p-16 border border-white/50 ring-1 ring-black/5 flex items-center justify-center min-w-[320px]">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 w-full min-h-[300px]">
      {content}
    </div>
  );
};

export default Loading;

