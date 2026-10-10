"use client";

import React, { useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, Brain, Loader2 } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface AvatarStageProps {
  isSpeaking: boolean;
  isLoading: boolean;
  currentText: string;
  videoUrl?: string;
  characterName?: string;
  onStopSpeaking: () => void;
  onReplaySpeech: () => void;
}

export const AvatarStage: React.FC<AvatarStageProps> = ({
  isSpeaking,
  isLoading,
  currentText,
  videoUrl = "/neuron-talk.mp4",
  characterName = "Neuron",
  onStopSpeaking,
  onReplaySpeech,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Set frame awal ke detik 0 saat video siap
  const handleLoadedMetadata = () => {
    if (videoRef.current && !isInitializedRef.current) {
      try {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
        isInitializedRef.current = true;
      } catch (e) {
        console.warn("Gagal mengatur frame awal video:", e);
      }
    }
  };

  // Sinkronisasi pemutaran video dengan status berbicara
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isSpeaking) {
      // Mulai putar video loop
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Video play error (mungkin diblokir browser):", err);
        });
      }
    } else {
      // Berhenti dan kembali ke pose diam (detik 0)
      video.pause();
      try {
        video.currentTime = 0;
      } catch (err) {
        console.warn("Error setting video idle time:", err);
      }
    }
  }, [isSpeaking]);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Label Nama Karakter / Peran di luar kotak avatar */}
      {characterName && (
        <div className="mb-2 z-10 animate-fade-in flex items-center justify-center">
          <div className="px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1.5 border border-zinc-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{characterName}</span>
          </div>
        </div>
      )}

      {/* Container Video Avatar 3D Tanpa Bingkai (Seamless) */}
      <div className="relative w-full max-w-[340px] aspect-[9/13] group flex justify-center items-center">
        
        {/* Video Avatar */}
        <video
          key={videoUrl}
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover object-center transform scale-105 rounded-[2rem] transition-opacity duration-500 animate-fade-in"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Status Indikator Minimalis */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-[11px] font-semibold text-zinc-700">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : isSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Audio Aktif</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>Standby</span>
              </>
            )}
          </div>

          {/* Tombol Stop / Ulang Suara Minimalis */}
          {isSpeaking ? (
            <button
              onClick={onStopSpeaking}
              type="button"
              suppressHydrationWarning
              title="Hentikan Suara"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-zinc-700 text-[11px] font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <VolumeX className="w-3 h-3" />
              <span>Hentikan</span>
            </button>
          ) : currentText ? (
            <button
              onClick={onReplaySpeech}
              type="button"
              suppressHydrationWarning
              title="Putar Ulang Suara"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-zinc-700 text-[11px] font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Dengarkan</span>
            </button>
          ) : null}
        </div>

        {/* Waveform Visualizer Minimalis */}
        <div className="absolute bottom-2 left-4 right-4 z-20 flex justify-center bg-white/60 backdrop-blur-md rounded-full py-1.5 shadow-sm opacity-90">
          <WaveformVisualizer isActive={isSpeaking} />
        </div>
      </div>

    </div>
  );
};
