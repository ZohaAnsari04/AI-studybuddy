import React from 'react';
import { NovaState } from '../../types';

interface NOVAOrbProps {
  state?: NovaState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  onClick?: () => void;
}

export const NOVAOrb: React.FC<NOVAOrbProps> = ({
  state = 'IDLE',
  size = 'md',
  showLabel = false,
  onClick
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  const orbSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  };

  const isThinking = state === 'THINKING' || state === 'ANALYZING';
  const isReading = state === 'READING';
  const isResponding = state === 'RESPONDING';
  const isSuccess = state === 'SUCCESS';

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer group select-none ${onClick ? 'hover:scale-105 transition-transform' : ''}`}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute rounded-full filter blur-md opacity-60 transition-all duration-500 ${sizeMap[size]} ${
          isSuccess
            ? 'bg-emerald-400 opacity-90 scale-125'
            : isThinking
            ? 'bg-cyan-400 animate-pulse opacity-90 scale-110'
            : isReading
            ? 'bg-purple-500 animate-pulse'
            : 'bg-gradient-to-r from-cyan-400 to-blue-600'
        }`}
      />

      {/* Orbit ring */}
      <div
        className={`absolute rounded-full border border-cyan-400/40 border-t-cyan-300 border-r-transparent ${sizeMap[size]} ${
          isThinking ? 'animate-orbit' : isReading ? 'animate-orbit-reverse' : 'animate-pulse-glow'
        }`}
      />

      {/* Central glowing core */}
      <div
        className={`relative rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-700 shadow-lg shadow-cyan-500/50 ${
          orbSizeMap[size]
        } ${isResponding ? 'animate-ping' : ''}`}
      >
        <div className="w-1/3 h-1/3 bg-white/90 rounded-full blur-[1px] animate-pulse" />
      </div>

      {showLabel && (
        <span className="ml-3 text-xs font-semibold tracking-wider text-cyan-300 uppercase glow-text-cyan">
          NOVA {state !== 'IDLE' && `• ${state}`}
        </span>
      )}
    </div>
  );
};
