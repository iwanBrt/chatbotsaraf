"use client";

import React, { useEffect, useState } from "react";
import { Volume2, X, Check, Play } from "lucide-react";
import {
  getIndonesianVoices,
  getIndonesianVoice,
  setSavedVoiceName,
  speakNeuronSpeech,
  stopNeuronSpeech,
} from "../utils/speech";

interface VoicePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREVIEW_TEXT =
  "Halo, saya akan menemanimu belajar sistem saraf melalui studi kasus. Ayo kita mulai!";

function describeVoice(v: SpeechSynthesisVoice): string {
  const n = v.name.toLowerCase();
  if (n.includes("natural") || n.includes("neural") || n.includes("online")) {
    return "Neural • paling manusiawi";
  }
  if (n.includes("google")) return "Google • cukup natural";
  return v.localService ? "Suara bawaan perangkat" : "Suara online";
}

export const VoicePicker: React.FC<VoicePickerProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const load = () => {
      setVoices(getIndonesianVoices());
      setSelected(getIndonesianVoice()?.name ?? null);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    setSelected(name);
    setSavedVoiceName(name);
    speakNeuronSpeech(PREVIEW_TEXT);
  };

  const handleClose = () => {
    stopNeuronSpeech();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl p-6 border border-zinc-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-zinc-900">Pilih Suara Chatbot</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {voices.length === 0 ? (
            <div className="text-sm text-zinc-600 space-y-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="font-semibold text-amber-900">
                Tidak ada suara Bahasa Indonesia di browser ini.
              </p>
              <p>
                Untuk suara paling manusiawi, buka aplikasi ini di <b>Microsoft Edge</b>{" "}
                (suara &quot;Gadis Online (Natural)&quot;) atau <b>Google Chrome</b>{" "}
                (suara &quot;Google Bahasa Indonesia&quot;).
              </p>
            </div>
          ) : (
            voices.map((v) => {
              const isActive = v.name === selected;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => handleSelect(v.name)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{v.name}</p>
                    <p className="text-[11px] text-zinc-500">{describeVoice(v)}</p>
                  </div>
                  {isActive ? (
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <Play className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <p className="text-[11px] text-zinc-500 pb-3">
          Klik suara untuk mendengar contoh. Pilihan disimpan otomatis di browser ini.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Simpan & Tutup
        </button>
      </div>
    </div>
  );
};
