"use client";

import React from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onStart: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl p-8 bg-white shadow-xl text-center flex flex-col items-center">
        
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
          Neuron Interactive
        </h2>

        <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
          Akses modul interaktif 3D untuk mempelajari anatomi dan sistem saraf manusia.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition-all cursor-pointer"
        >
          Mulai Sesi
        </button>

        <p className="text-[11px] text-zinc-400 mt-5 font-medium">
          Aplikasi membutuhkan izin akses audio.
        </p>
      </div>
    </div>
  );
};
