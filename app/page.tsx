"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Brain,
  Sparkles,
  MessageSquare,
  History,
  X,
  RefreshCw,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Stethoscope,
  Activity,
  Award,
} from "lucide-react";
import { AvatarStage } from "./components/AvatarStage";
import { WelcomeModal } from "./components/WelcomeModal";
import { speakNeuronSpeech, stopNeuronSpeech } from "./utils/speech";
import { LEARNING_CASES, LearningCase } from "./data/learningCases";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const INITIAL_GREETING =
  "Halo! Saya asisten edukasi sistem saraf. Untuk mempelajari anatomi sistem saraf dengan mendalam, kita akan menggunakan pendekatan studi kasus klinis. Silakan pilih salah satu kasus pasien di bawah untuk memulai analisis investigasi!";

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
  const [learningPhase, setLearningPhase] = useState<
    "topic_selection" | "case_study" | "completed"
  >("topic_selection");
  const [hasStarted, setHasStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // State khusus pelacakan Studi Kasus update.md
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [currentStepTitle, setCurrentStepTitle] = useState<string>("");
  const [activeRoleName, setActiveRoleName] = useState<string>("");
  const [isCaseCompleted, setIsCaseCompleted] = useState<boolean>(false);

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

  const activeCase = LEARNING_CASES.find((c) => c.id === activeCaseId);

  // Handle awal interaksi saat klik "Mulai Belajar"
  const handleStartInteraction = () => {
    setHasStarted(true);
    setMessages([{ role: "model", content: INITIAL_GREETING }]);
    setCurrentReply(INITIAL_GREETING);

    speakNeuronSpeech(INITIAL_GREETING, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Kirim pesan ke API chat (dengan integrasi skrip naskah update.md)
  const handleSendMessage = async (
    textToSend?: string,
    overrideCaseId?: string,
    overrideStep?: number
  ) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isLoading) return;

    stopNeuronSpeech();
    setIsSpeaking(false);

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: query },
    ];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    const targetCaseId = overrideCaseId ?? activeCaseId ?? undefined;
    const targetStep = overrideStep ?? currentStepNumber;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: updatedMessages.slice(-6),
          phase: learningPhase,
          currentCharacter: currentCharacter,
          caseId: targetCaseId,
          stepNumber: targetStep,
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        "Maaf, sambungan saya sedikit terganggu. Coba tanyakan lagi ya!";
      const newChar = data.character || currentCharacter || "neuron";

      setCurrentReply(reply);
      setCurrentCharacter(newChar);
      setMessages((prev) => [...prev, { role: "model", content: reply }]);

      if (data.caseId) {
        setActiveCaseId(data.caseId);
      }
      if (data.stepNumber) {
        setCurrentStepNumber(data.stepNumber);
      }
      if (data.stepTitle) {
        setCurrentStepTitle(data.stepTitle);
      }
      if (data.roleName) {
        setActiveRoleName(data.roleName);
      }

      if (data.isCompleted) {
        setIsCaseCompleted(true);
        setLearningPhase("completed");
      } else {
        setIsCaseCompleted(false);
        setLearningPhase("case_study");
      }

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

  // Pilih kasus secara langsung dari daftar
  const handleSelectCase = (caseItem: LearningCase) => {
    setActiveCaseId(caseItem.id);
    setCurrentStepNumber(1);
    setCurrentStepTitle(caseItem.steps[0].title);
    setActiveRoleName(caseItem.roleName);
    setCurrentCharacter(caseItem.character);
    setIsCaseCompleted(false);
    setLearningPhase("case_study");

    handleSendMessage(`Mulai kasus: ${caseItem.title}`, caseItem.id, 1);
  };

  // Beralih ke kasus berikutnya
  const handleNextCase = () => {
    const currentIndex = LEARNING_CASES.findIndex((c) => c.id === activeCaseId);
    const nextCase =
      LEARNING_CASES[(currentIndex + 1) % LEARNING_CASES.length] ||
      LEARNING_CASES[0];
    handleSelectCase(nextCase);
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

  const currentCharData =
    CHARACTER_MAP[currentCharacter] || CHARACTER_MAP["neuron"];

  return (
    <main
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-zinc-100/70 text-zinc-900 relative overflow-hidden"
    >
      {/* Modal Welcome / Audio Unlock */}
      <WelcomeModal isOpen={!hasStarted} onStart={handleStartInteraction} />

      {/* Frame Kontainer Utama */}
      <div className="relative w-full max-w-[440px] min-h-[92vh] flex flex-col justify-between p-4 sm:p-5 bg-white sm:rounded-3xl sm:shadow-xl sm:border sm:border-zinc-200/80 overflow-hidden">
        {/* Header Bagian Atas */}
        <header className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-tight">
                  SarafBot PBL
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Problem-Based
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {activeRoleName || "Modul Investigasi Sistem Saraf"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Lihat Skenario (jika sedang dalam kasus) */}
            {activeCase && learningPhase !== "topic_selection" && (
              <button
                onClick={() => setShowScenarioModal(true)}
                type="button"
                title="Lihat Skenario Pasien"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 font-medium text-xs transition-all active:scale-95 cursor-pointer border border-zinc-200"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Kasus</span>
              </button>
            )}

            {/* Tombol Buka Riwayat Percakapan */}
            <button
              onClick={() => setShowHistory(true)}
              type="button"
              title="Riwayat Percakapan"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 font-medium text-xs transition-all active:scale-95 cursor-pointer border border-zinc-200"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Center Main Stage: Avatar 3D & Speech Synchronization */}
        <div className="flex-1 flex flex-col justify-center items-center py-2 relative">
          <AvatarStage
            isSpeaking={isSpeaking}
            isLoading={isLoading}
            currentText={currentReply}
            videoUrl={currentCharData.video}
            characterName={activeRoleName || currentCharData.name}
            onStopSpeaking={handleStopSpeaking}
            onReplaySpeech={handleReplaySpeech}
          />
        </div>

        {/* Bottom Section: Chat Input or Topic Selection */}
        <footer className="w-full flex flex-col gap-2.5 pt-1">
          {learningPhase === "topic_selection" ? (
            <div className="flex flex-col gap-2 max-h-[310px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Pilih Kasus Investigasi
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  5 Studi Kasus PBL
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {LEARNING_CASES.map((c, index) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    disabled={isLoading || isSpeaking}
                    className="p-3 rounded-xl bg-zinc-50/80 hover:bg-zinc-100 border border-zinc-200/90 text-left transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-between group shadow-sm hover:shadow"
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800">
                          Kasus {index + 1}
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {c.roleName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {c.scenario}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Status Bar Tahapan Kasus */}
              <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-800 truncate max-w-[200px]">
                      {activeCase ? activeCase.title.split(":")[0] : "Studi Kasus"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLearningPhase("topic_selection")}
                    disabled={isLoading || isSpeaking}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ganti Kasus</span>
                  </button>
                </div>

                {/* Indikator 4 Tahapan Dialog */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-200/60">
                  <span className="text-[11px] font-medium text-zinc-600">
                    Tahap {currentStepNumber} dari 4:{" "}
                    <strong className="text-zinc-900 font-semibold">
                      {currentStepTitle || `Langkah ${currentStepNumber}`}
                    </strong>
                  </span>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((step) => {
                      const isPast = step < currentStepNumber;
                      const isCurrent = step === currentStepNumber;
                      return (
                        <div
                          key={step}
                          className={`w-4 h-1.5 rounded-full transition-all ${
                            isPast
                              ? "bg-emerald-500"
                              : isCurrent
                              ? "bg-zinc-900 w-6"
                              : "bg-zinc-200"
                          }`}
                          title={`Tahap ${step}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Banner Selesai jika kasus tuntas */}
              {isCaseCompleted && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-900">Kasus Selesai Tuntas!</p>
                      <p className="text-emerald-700 text-[11px]">
                        Semua 4 tahap investigasi telah kamu pecahkan.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNextCase}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm"
                  >
                    Kasus Lain &rarr;
                  </button>
                </div>
              )}

              {/* Input Chat Box */}
              <form
                suppressHydrationWarning
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center w-full"
              >
                <input
                  ref={inputRef}
                  type="text"
                  suppressHydrationWarning
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isLoading
                      ? "Menganalisis jawabanmu..."
                      : isSpeaking
                      ? "Mendengarkan penjelasan..."
                      : `Ketik jawabanmu untuk Tahap ${currentStepNumber}...`
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
            </>
          )}
        </footer>
      </div>

      {/* Modal Detail Skenario Pasien */}
      {showScenarioModal && activeCase && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-zinc-900">
                  {activeCase.title}
                </h3>
              </div>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-zinc-700">
              <div>
                <h5 className="font-bold text-xs uppercase text-zinc-400 tracking-wider mb-1">
                  Skenario Pasien
                </h5>
                <p className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 leading-relaxed text-zinc-800">
                  {activeCase.scenario}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase text-zinc-400 tracking-wider mb-1">
                  Tujuan Pembelajaran
                </h5>
                <p className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 leading-relaxed text-indigo-900 text-xs font-medium">
                  {activeCase.learningGoal}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase text-zinc-400 tracking-wider mb-1">
                  Peran AI Pendamping
                </h5>
                <p className="text-xs text-zinc-600 font-semibold flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  {activeCase.roleName} ({currentCharData.name})
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowScenarioModal(false)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Tutup & Lanjutkan Diskusi
            </button>
          </div>
        </div>
      )}

      {/* Modal Riwayat Percakapan */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl p-6 border border-zinc-200">
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
                      {msg.role === "user"
                        ? "Pengguna"
                        : activeRoleName || currentCharData.name}
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
