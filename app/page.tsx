"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Brain, Sparkles, MessageSquare, History, X, RefreshCw } from "lucide-react";
import { AvatarStage } from "./components/AvatarStage";
import { SuggestionChips } from "./components/SuggestionChips";
import { WelcomeModal } from "./components/WelcomeModal";
import { speakNeuronSpeech, stopNeuronSpeech } from "./utils/speech";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const INITIAL_GREETING =
  "Selamat datang di Neuron Interactive. Saya adalah asisten anatomi Anda. Ada yang bisa saya bantu terkait anatomi dan sistem saraf tubuh manusia hari ini?";

const CHARACTER_MAP: Record<string, { name: string; video: string }> = {
  neuron: { name: "Neuron", video: "/neuron-talk.mp4" },
  badansel: { name: "Badan Sel", video: "/Badan Sel.mp4" },
  batangotak: { name: "Batang Otak", video: "/BatangOtak.mp4" },
  dendrit: { name: "Dendrit", video: "/Dendrit.mp4" },
  ganglia: { name: "Ganglia", video: "/Ganglia.mp4" },
  neurit: { name: "Neurit (Akson)", video: "/neurit.mp4" },
  otakbesar: { name: "Otak Besar (Cerebrum)", video: "/OtakBesar(cerebrum).mp4" },
  otakkecil: { name: "Otak Kecil (Cerebellum)", video: "/OtakKecil(Cerebellum).mp4" },
  sarafkranial: { name: "Saraf Kranial", video: "/Saraf Kranial.mp4" },
  sarafspinal: { name: "Saraf Spinal", video: "/Saraf Spinal.mp4" },
  sumsum: { name: "Sumsum Tulang Belakang", video: "/Sumsum Tulang Belakang.mp4" },
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentReply, setCurrentReply] = useState(INITIAL_GREETING);
  const [currentCharacter, setCurrentCharacter] = useState("neuron");
  const [hasStarted, setHasStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Pre-load voices on client
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Scroll to bottom of history modal when opened
  useEffect(() => {
    if (showHistory) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showHistory, messages]);

  // Handle awal interaksi saat klik "Sapa Neuron"
  const handleStartInteraction = () => {
    setHasStarted(true);
    setMessages([{ role: "model", content: INITIAL_GREETING }]);
    setCurrentReply(INITIAL_GREETING);

    // Mainkan suara sapaan pertama dengan sinkronisasi video
    speakNeuronSpeech(INITIAL_GREETING, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Kirim pesan ke API Gemini 2.0 Flash
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isLoading) return;

    // Hentikan suara jika sedang berbicara
    stopNeuronSpeech();
    setIsSpeaking(false);

    // Update state pesan user
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: query },
    ];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: updatedMessages.slice(-6), // Jendela memori 6 pesan terakhir
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        "Maaf, sambungan saya sedikit terganggu. Coba tanyakan lagi ya!";
      const newChar = data.character || "neuron";

      setCurrentReply(reply);
      setCurrentCharacter(newChar);
      setMessages((prev) => [...prev, { role: "model", content: reply }]);

      // Putar suara respon Neuron & sync video loop
      speakNeuronSpeech(reply, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      const fallback =
        "Bzzzt! Waduh, ada sedikit gangguan di kabel sarafku. Boleh tanyakan sekali lagi?";
      setCurrentReply(fallback);
      speakNeuronSpeech(fallback, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSpeaking = () => {
    stopNeuronSpeech();
    setIsSpeaking(false);
  };

  const handleReplaySpeech = () => {
    if (!currentReply) return;
    speakNeuronSpeech(currentReply, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const currentCharData = CHARACTER_MAP[currentCharacter] || CHARACTER_MAP["neuron"];

  return (
    <main
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-zinc-50 text-zinc-900 relative overflow-hidden"
    >
      {/* Modal Welcome / Audio Unlock */}
      <WelcomeModal isOpen={!hasStarted} onStart={handleStartInteraction} />

      {/* Frame Kontainer Utama */}
      <div className="relative w-full max-w-[420px] min-h-[92vh] flex flex-col justify-between p-4 sm:p-5 overflow-hidden">
        {/* Header Bagian Atas */}
        <header className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                  Neuron
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-700">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Modul Pembelajaran Anatomi 3D
              </p>
            </div>
          </div>

          {/* Tombol Buka Riwayat Percakapan */}
          <button
            onClick={() => setShowHistory(true)}
            type="button"
            title="Riwayat Percakapan"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-zinc-100 text-zinc-600 font-medium text-xs transition-all active:scale-95 cursor-pointer border border-zinc-200"
          >
            <History className="w-4 h-4" />
          </button>
        </header>

        {/* Center Main Stage: Avatar 3D & Speech Synchronization */}
        <div className="flex-1 flex flex-col justify-center items-center py-4">
          <AvatarStage
            isSpeaking={isSpeaking}
            isLoading={isLoading}
            currentText={currentReply}
            videoUrl={currentCharData.video}
            characterName={currentCharData.name}
            onStopSpeaking={handleStopSpeaking}
            onReplaySpeech={handleReplaySpeech}
          />
        </div>

        {/* Bottom Section: Suggestion Chips & Floating Chat Input */}
        <footer className="w-full flex flex-col gap-3 pt-2">
          {/* Suggestion Chips */}
          <SuggestionChips
            onSelect={(prompt) => handleSendMessage(prompt)}
            disabled={isLoading || isSpeaking}
          />

          {/* Input Chat Box */}
          <form
            suppressHydrationWarning
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center w-full mt-2"
          >
            <input
              ref={inputRef}
              type="text"
              suppressHydrationWarning
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isLoading
                  ? "Memproses respons..."
                  : isSpeaking
                  ? "Neuron sedang berbicara..."
                  : "Ketik pertanyaan..."
              }
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-white border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              suppressHydrationWarning
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </footer>
      </div>

      {/* Modal Riwayat Percakapan */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl p-6">
            {/* Header Riwayat */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-zinc-700" />
                <h3 className="font-bold text-base text-zinc-900">
                  Riwayat Diskusi
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Pesan */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-sm font-medium text-zinc-400 py-10">
                  Belum ada diskusi.
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-zinc-400 mb-1 px-1">
                      {msg.role === "user" ? "Pengguna" : "Neuron"}
                    </span>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-zinc-900 text-white rounded-br-sm"
                          : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
