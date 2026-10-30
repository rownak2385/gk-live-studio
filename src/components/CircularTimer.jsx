import React from 'react';
import { toBengaliNumber } from '../utils/bengali';

export default function CircularTimer({ timeLeft, totalTime = 60, isRunning }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  // Color Stage Decision:
  // Phase 1 (> 30s): Electric Neon Blue
  // Phase 2 (15s - 30s): Transition to Neon Amber / Warm Orange
  // Phase 3 (<= 15s): Radiant High-Voltage Neon Red
  const isPhaseBlue = timeLeft > 30;
  const isPhaseAmber = timeLeft <= 30 && timeLeft > 15;
  const isPhaseRed = timeLeft <= 15;
  const isCritical = timeLeft <= 5;

  return (
    <div className={`relative flex items-center justify-center ${isCritical ? 'animate-heartbeat' : ''}`}>
      {/* Outer Neon Ambient Aura */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isPhaseRed
            ? 'bg-rose-600/35 blur-2xl scale-125 animate-pulse'
            : isPhaseAmber
            ? 'bg-amber-500/30 blur-xl scale-115'
            : 'bg-cyan-500/25 blur-xl scale-110'
        }`}
      />

      <svg 
        className={`w-32 h-32 md:w-36 md:h-36 transform -rotate-90 relative z-10 transition-all duration-500 ${
          isPhaseRed
            ? 'neon-glow-red'
            : isPhaseAmber
            ? 'neon-glow-amber'
            : 'neon-glow-cyan'
        }`}
      >
        {/* Background Track with subtle tint */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={
            isPhaseRed
              ? 'rgba(244, 63, 94, 0.15)'
              : isPhaseAmber
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(6, 182, 212, 0.15)'
          }
          strokeWidth="6"
          fill="transparent"
        />

        {/* Dynamic Neon Animated Progress Ring */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="url(#dynamicNeonGradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-linear"
        />

        {/* Gradient Definition: Changes color dynamically */}
        <defs>
          <linearGradient id="dynamicNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {isPhaseRed ? (
              <>
                <stop offset="0%" stopColor="#ff0055" />
                <stop offset="50%" stopColor="#ff2a2a" />
                <stop offset="100%" stopColor="#f43f5e" />
              </>
            ) : isPhaseAmber ? (
              <>
                <stop offset="0%" stopColor="#ffb703" />
                <stop offset="50%" stopColor="#fb8500" />
                <stop offset="100%" stopColor="#f59e0b" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#00f5ff" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>

      {/* Central Display with Matching Neon Glow */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 select-none">
        <span 
          className={`font-tiro text-3xl md:text-4xl font-extrabold tracking-tight transition-all duration-500 ${
            isPhaseRed 
              ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]' 
              : isPhaseAmber 
              ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]' 
              : 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.85)]'
          }`}
        >
          {toBengaliNumber(timeLeft)}
        </span>
        <span 
          className={`font-tiro text-xs tracking-wider font-semibold -mt-1 transition-colors duration-500 ${
            isPhaseRed 
              ? 'text-rose-300/80' 
              : isPhaseAmber 
              ? 'text-amber-200/80' 
              : 'text-cyan-200/80'
          }`}
        >
          সেকেন্ড
        </span>
      </div>
    </div>
  );
}
