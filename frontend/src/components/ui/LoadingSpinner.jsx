import React from 'react';
import { Spinner } from "@nextui-org/react";

/**
 * Composant LoadingSpinner - Indicateur de chargement Premium
 */
const LoadingSpinner = ({
  message = 'Préparation de votre univers...',
  size = 'lg',
  color = 'primary',
  fullScreen = false
}) => {

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md' : 'w-full py-20'}`}>

      {/* Animated Logo Container using pure CSS for robustness */}
      <div className="relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-bounce delay-75"></div>

        {/* Logo / Spinner */}
        <div className="relative z-10 flex flex-col items-center">
          {/* You can replace this Spinner with a Logo image if available */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 animate-spin-slow p-[2px]">
            <div className="bg-[#0f111a] rounded-full p-1">
              <img
                src={require('../../assets/images/logo-removebg-preview.png')}
                alt="Thinking..."
                className="w-16 h-16 object-contain animate-pulse"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Typography */}
      <div className="flex flex-col items-center gap-1 relative z-10">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          GenesisCode
        </h3>
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          {message}
        </p>
      </div>

      {/* Optional: Simple CSS for custom spin if not using Tailwind's animate-spin */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;