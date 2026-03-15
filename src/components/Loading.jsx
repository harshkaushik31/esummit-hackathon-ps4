import React from 'react';

const LoadingPage = ({ message = "INITIALIZING SYSTEM...", showSpinner = true }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden z-50">
      
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="text-center p-8 relative z-10 w-full max-w-md">
        {showSpinner && (
          <div className="relative mb-12 flex justify-center">
            {/* Outer scanning rings */}
            <div className="w-32 h-32 border border-cyan-500/30 rounded-full absolute animate-[spin_4s_linear_infinite]"></div>
            <div className="w-32 h-32 border-t-2 border-r-2 border-cyan-400 rounded-full animate-[spin_2s_linear_infinite] shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            
            {/* Inner radar sweep */}
            <div className="w-24 h-24 absolute top-4 border border-teal-500/40 rounded-full overflow-hidden">
              <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_70%,rgba(6,182,212,0.8)_100%)] absolute -left-1/4 -top-1/4 animate-[spin_3s_linear_infinite] origin-center"></div>
            </div>
            
            {/* Center target node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-full shadow-[0_0_10px_#fff,0_0_20px_#06b6d4]"></div>
          </div>
        )}
        
        {/* Loading text with animation */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-cyan-400 tracking-[0.2em] font-mono shadow-cyan-500 flex items-center justify-center gap-2">
            <span className="w-2 h-5 bg-cyan-400 animate-pulse block"></span>
            {message}
          </h2>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-900 rounded-full mx-auto overflow-hidden border border-cyan-500/20 relative">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[translateX_2s_ease-in-out_infinite] blur-[2px]"></div>
            <div className="h-full bg-cyan-500/50 w-full animate-pulse"></div>
          </div>
          
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-4">
            Decrypting feeds . Please stand by .
          </p>
        </div>
      </div>
    </div>
  );
};

// Alternative minimal loading component
export const MinimalLoader = ({ size = "md", color = "cyan" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4"
  };
  
  const colorClasses = {
    cyan: "border-cyan-500/30 border-t-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
    gray: "border-gray-600/30 border-t-gray-400",
    green: "border-teal-500/30 border-t-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]",
    red: "border-red-500/30 border-t-red-500"
  };
  
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
    </div>
  );
};

// Skeleton loading component
export const SkeletonLoader = ({ lines = 3 }) => {
  return (
    <div className="animate-pulse p-6 space-y-4 border border-cyan-500/20 bg-gray-950/50 rounded-lg">
      <div className="h-4 bg-cyan-900/40 rounded w-3/4 shadow-[0_0_8px_rgba(6,182,212,0.2)]"></div>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 bg-gray-800 rounded"></div>
      ))}
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton = () => {
  return (
    <div className="border border-cyan-500/30 bg-gray-950 rounded-2xl p-6 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      
      <div className="flex items-center space-x-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-cyan-900/30 rounded-full border border-cyan-500/20"></div>
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-cyan-900/40 rounded w-1/2"></div>
          <div className="h-2 bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="h-2 bg-gray-800 rounded"></div>
        <div className="h-2 bg-gray-800 rounded w-5/6"></div>
        <div className="h-2 bg-gray-800 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default LoadingPage;