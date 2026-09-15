"use client";

import React from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isActive }) => {
  const bars = [
    { height: "h-2", activeHeight: "animate-pulse h-5" },
    { height: "h-1.5", activeHeight: "animate-bounce h-7 delay-75" },
    { height: "h-3", activeHeight: "animate-pulse h-9 delay-150" },
    { height: "h-2", activeHeight: "animate-bounce h-6 delay-100" },
    { height: "h-4", activeHeight: "animate-pulse h-8 delay-200" },
    { height: "h-2.5", activeHeight: "animate-bounce h-5 delay-75" },
    { height: "h-3", activeHeight: "animate-pulse h-9 delay-300" },
    { height: "h-1.5", activeHeight: "animate-bounce h-6 delay-150" },
    { height: "h-2", activeHeight: "animate-pulse h-4 delay-100" },
  ];

  return (
    <div className="flex items-center justify-center h-10">
      <div className="flex items-center gap-1 h-10">
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-300 ${
              isActive
                ? `bg-blue-500 ${bar.activeHeight}`
                : `bg-zinc-300 ${bar.height}`
            }`}
          />
        ))}
      </div>
    </div>
  );
};
