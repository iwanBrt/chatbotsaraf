"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  Brain,
  Sliders,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { LEARNING_CASES, LearningCase } from "../data/learningCases";

interface CaseSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string | null;
  currentStepNumber?: number;
}

export const CaseSimulationModal: React.FC<CaseSimulationModalProps> = ({
  isOpen,
  onClose,
  initialCaseId,
  currentStepNumber = 1,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || "kasus-1"
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [comparisonMode, setComparisonMode] = useState<"normal" | "abnormal">(
    "abnormal"
  ); // default to the case problem
  const [impulseProgress, setImpulseProgress] = useState<number>(0);
  const [actionPotentialPhase, setActionPotentialPhase] = useState<
    "resting" | "depolarizing" | "repolarizing"
  >("resting");
  const [selectedElementInfo, setSelectedElementInfo] = useState<string | null>(
    null
  );

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync selected case if modal is opened with new initialCaseId
  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
    }
  }, [initialCaseId]);

  // Main animation ticker loop for impulses and particle states
  useEffect(() => {
    if (!isOpen) return;

    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = (time - lastTimeRef.current) / 1000;
        setImpulseProgress((prev) => {
          // speed factor
          const baseRate =
            selectedCaseId === "kasus-1" && comparisonMode === "abnormal"
              ? 0.25 // Impuls melambat karena mielin rusak
              : 0.55;
          const next = prev + delta * baseRate * speed;
          return next > 1 ? 0 : next;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    };
  }, [isOpen, isPlaying, speed, selectedCaseId, comparisonMode]);

  // Phase tracker for Kasus 2
  useEffect(() => {
    if (impulseProgress < 0.25) {
      setActionPotentialPhase("resting");
    } else if (impulseProgress < 0.65) {
      setActionPotentialPhase("depolarizing");
    } else {
      setActionPotentialPhase("repolarizing");
    }
  }, [impulseProgress]);

  if (!isOpen) return null;

  const currentCase =
    LEARNING_CASES.find((c) => c.id === selectedCaseId) || LEARNING_CASES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
        {/* ================= HEADER MODAL ================= */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Simulasi Biologi Interaktif
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PBL Bio-Saraf
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {currentCase.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Tutup Simulasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= TAB KASUS (1 - 5) ================= */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/40 overflow-x-auto no-scrollbar">
          {LEARNING_CASES.map((item, idx) => {
            const isSelected = item.id === selectedCaseId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedCaseId(item.id);
                  setImpulseProgress(0);
                  setSelectedElementInfo(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isSelected
                      ? "bg-white text-indigo-700"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[150px]">
                  {item.title.split(":")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= BODY SIMULASI ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* CONTROL BAR SIMULASI */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            {/* Play, Pause, Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setImpulseProgress(0)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                title="Ulangi dari Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 ml-1">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      speed === s
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Switcher: Normal vs Masalah Kasus */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setComparisonMode("normal")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  comparisonMode === "normal"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kondisi Normal</span>
              </button>
              <button
                onClick={() => setComparisonMode("abnormal")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  comparisonMode === "abnormal"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Kondisi Kasus Terganggu</span>
              </button>
            </div>
          </div>

          {/* ================= CANVAS / SVG STAGE BERDASARKAN KASUS ================= */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/90 p-4 min-h-[300px] flex flex-col justify-center items-center overflow-hidden shadow-inner">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* ----------------- KASUS 1: AKSON & SELUBUNG MIELIN ----------------- */}
            {selectedCaseId === "kasus-1" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs text-zinc-400 mb-2 px-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <strong>Dendrit & Badan Sel</strong>
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Arah Rambatan Potensial Aksi &rarr;
                  </span>
                  <span className="flex items-center gap-1.5">
                    <strong>Ujung Terminal Akson</strong>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  </span>
                </div>

                <svg
                  viewBox="0 0 700 240"
                  className="w-full h-auto drop-shadow-lg"
                >
                  <defs>
                    <linearGradient
                      id="somaGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient
                      id="myelinNormal"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient
                      id="myelinDamaged"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#881337" />
                    </linearGradient>
                    <filter
                      id="glow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Dendrit-dendrit di sebelah kiri */}
                  <g
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  >
                    <line x1="100" y1="120" x2="30" y2="70" />
                    <line x1="30" y1="70" x2="10" y2="50" />
                    <line x1="30" y1="70" x2="15" y2="90" />
                    <line x1="100" y1="120" x2="25" y2="120" />
                    <line x1="25" y1="120" x2="5" y2="135" />
                    <line x1="100" y1="120" x2="35" y2="170" />
                    <line x1="35" y1="170" x2="15" y2="190" />
                  </g>

                  {/* Badan Sel (Soma) */}
                  <path
                    d="M 100 120 C 80 80, 150 70, 140 120 C 150 160, 80 160, 100 120 Z"
                    fill="url(#somaGrad)"
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Badan Sel (Soma): Pusat metabolisme neuron yang berisi nukleus dan memproses impuls dari dendrit."
                      )
                    }
                  />
                  {/* Inti Sel / Nukleus */}
                  <circle cx="112" cy="118" r="14" fill="#0369a1" />
                  <circle cx="110" cy="116" r="5" fill="#bae6fd" />

                  {/* Batang Akson Silindris Panjang */}
                  <line
                    x1="135"
                    y1="120"
                    x2="600"
                    y2="120"
                    stroke="#64748b"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Selubung Mielin (4 segmen di sepanjang akson) */}
                  {[
                    { x: 170, damaged: false, label: "Mielin 1" },
                    {
                      x: 275,
                      damaged: comparisonMode === "abnormal",
                      label: "Mielin 2 (Area Kasus Andi)",
                    },
                    {
                      x: 380,
                      damaged: comparisonMode === "abnormal",
                      label: "Mielin 3 (Terganggu)",
                    },
                    { x: 485, damaged: false, label: "Mielin 4" },
                  ].map((seg, idx) => (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all"
                      onClick={() =>
                        setSelectedElementInfo(
                          seg.damaged
                            ? "Area Mielin Terganggu (Kasus Andi): Lapisan mielin menipis atau rusak, menyebabkan potensial aksi melambat drastis dan arus listrik bocor!"
                            : "Selubung Mielin Normal: Lapisan lipid isolator yang memungkinkan konduksi saltatori sangat cepat melompati Nodus Ranvier."
                        )
                      }
                    >
                      {/* Sel Schwann / Selubung Mielin */}
                      <rect
                        x={seg.x}
                        y={seg.damaged ? "106" : "96"}
                        width="85"
                        height={seg.damaged ? "28" : "48"}
                        rx="12"
                        fill={
                          seg.damaged
                            ? "url(#myelinDamaged)"
                            : "url(#myelinNormal)"
                        }
                        stroke={seg.damaged ? "#f43f5e" : "#fef08a"}
                        strokeWidth={seg.damaged ? "2" : "1.5"}
                        strokeDasharray={seg.damaged ? "4 3" : "none"}
                        className="transition-all duration-300 hover:brightness-110"
                      />
                      {/* Titik inti sel Schwann */}
                      <circle
                        cx={seg.x + 42}
                        cy={seg.damaged ? "120" : "106"}
                        r="4"
                        fill="#ffffff"
                        opacity="0.8"
                      />
                      {seg.damaged && (
                        <text
                          x={seg.x + 42}
                          y="142"
                          textAnchor="middle"
                          fill="#fecdd3"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          RUSAK ⚠
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Nodus Ranvier (Celah antar mielin) */}
                  {[260, 365, 470, 575].map((nx, idx) => (
                    <g key={idx}>
                      <line
                        x1={nx}
                        y1="102"
                        x2={nx}
                        y2="138"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="2 2"
                      />
                      <circle cx={nx} cy="120" r="4" fill="#38bdf8" opacity="0.6" />
                    </g>
                  ))}

                  {/* Terminal Akson di Ujung Kanan */}
                  <g
                    stroke="#64748b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Terminal Akson: Ujung akson yang akan meneruskan sinyal ke neuron berikutnya atau ke otot."
                      )
                    }
                  >
                    <line x1="590" y1="120" x2="640" y2="85" />
                    <circle cx="642" cy="84" r="7" fill="#06b6d4" />

                    <line x1="590" y1="120" x2="655" y2="120" />
                    <circle cx="658" cy="120" r="7" fill="#06b6d4" />

                    <line x1="590" y1="120" x2="640" y2="155" />
                    <circle cx="642" cy="156" r="7" fill="#06b6d4" />
                  </g>

                  {/* PARTIKEL IMPULS LISTRIK BERGERAK */}
                  {(() => {
                    const currentX = 120 + impulseProgress * (650 - 120);
                    const isInsideDamagedArea =
                      comparisonMode === "abnormal" &&
                      currentX >= 275 &&
                      currentX <= 465;

                    return (
                      <g filter="url(#glow)">
                        {/* Bola Kilatan Impuls Utama */}
                        <circle
                          cx={currentX}
                          cy="120"
                          r={isInsideDamagedArea ? "6" : "10"}
                          fill={isInsideDamagedArea ? "#fb7185" : "#facc15"}
                        />
                        <circle
                          cx={currentX}
                          cy="120"
                          r={isInsideDamagedArea ? "12" : "20"}
                          fill={isInsideDamagedArea ? "#fb7185" : "#fef08a"}
                          opacity="0.35"
                        />

                        {/* Efek kebocoran muatan listrik jika mielin rusak */}
                        {isInsideDamagedArea && (
                          <g>
                            <line
                              x1={currentX}
                              y1="110"
                              x2={currentX - 10}
                              y2="80"
                              stroke="#f43f5e"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray="3 2"
                            />
                            <text
                              x={currentX}
                              y="72"
                              fill="#f43f5e"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              Arus Bocor & Melambat!
                            </text>
                            <line
                              x1={currentX}
                              y1="130"
                              x2={currentX + 10}
                              y2="160"
                              stroke="#f43f5e"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray="3 2"
                            />
                          </g>
                        )}

                        {/* Efek Loncatan Konduksi Saltatori Normal */}
                        {!isInsideDamagedArea && comparisonMode === "normal" && (
                          <text
                            x={currentX}
                            y="75"
                            fill="#facc15"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            ⚡ Konduksi Saltatori Cepat
                          </text>
                        )}
                      </g>
                    );
                  })()}
                </svg>

                {/* Status Bar Kasus 1 */}
                <div className="w-full mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comparisonMode === "normal" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-medium text-zinc-300">
                      {comparisonMode === "normal"
                        ? "Mielin utuh: Impuls melompat cepat dari nodus ke nodus (100 m/s)."
                        : "Kasus Andi: Mielin rusak membuat impuls melambat & bocor, menyebabkan gangguan koordinasi gerak!"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Posisi: {Math.round(impulseProgress * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* ----------------- KASUS 2: POTENSIAL AKSI & KANAL ION Na+/K+ ----------------- */}
            {selectedCaseId === "kasus-2" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs text-zinc-400 mb-2 px-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <strong>Ion Na⁺ (Natrium)</strong>
                  </span>
                  <span className="font-bold text-indigo-400">
                    Irisan Membran Akson & Kanal Ion
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <strong>Ion K⁺ (Kalium)</strong>
                  </span>
                </div>

                <svg viewBox="0 0 650 240" className="w-full h-auto">
                  {/* Cairan Ekstraseluler (Luar Membran) */}
                  <rect x="0" y="0" width="650" height="75" fill="#1e293b" opacity="0.3" />
                  <text x="20" y="25" fill="#94a3b8" fontSize="11" fontWeight="bold">
                    Cairan Ekstraseluler (Luar Sel)
                  </text>

                  {/* Lipid Bilayer Membran (Lapisan Atas & Bawah) */}
                  <rect x="0" y="80" width="650" height="15" fill="#475569" rx="3" />
                  <rect x="0" y="145" width="650" height="15" fill="#475569" rx="3" />
                  <text x="20" y="123" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                    Membran Akson
                  </text>

                  {/* Cairan Intraseluler (Dalam Sel) */}
                  <rect x="0" y="165" width="650" height="75" fill="#0f172a" opacity="0.4" />
                  <text x="20" y="225" fill="#94a3b8" fontSize="11" fontWeight="bold">
                    Sitosol / Intraseluler (Dalam Sel)
                  </text>

                  {/* KANAL ION Na+ */}
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Kanal Ion Na⁺: Membuka saat depolarisasi, memungkinkan Na⁺ masuk deras ke dalam sel dan menaikkan potensial membran hingga +30mV."
                      )
                    }
                  >
                    <rect
                      x="220"
                      y="70"
                      width="50"
                      height="100"
                      rx="8"
                      fill={
                        actionPotentialPhase === "depolarizing"
                          ? "#f59e0b"
                          : "#78350f"
                      }
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <text
                      x="245"
                      y="125"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Kanal Na⁺
                    </text>
                    <text
                      x="245"
                      y="60"
                      fill={
                        actionPotentialPhase === "depolarizing"
                          ? "#34d399"
                          : "#f87171"
                      }
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {actionPotentialPhase === "depolarizing"
                        ? "TERBUKA ✓"
                        : "TERTUTUP"}
                    </text>
                  </g>

                  {/* KANAL ION K+ */}
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Kanal Ion K⁺: Membuka saat repolarisasi, memungkinkan K⁺ keluar sel untuk mengembalikan potensial negatif membran (-70mV)."
                      )
                    }
                  >
                    <rect
                      x="380"
                      y="70"
                      width="50"
                      height="100"
                      rx="8"
                      fill={
                        actionPotentialPhase === "repolarizing"
                          ? "#a855f7"
                          : "#581c87"
                      }
                      stroke="#c084fc"
                      strokeWidth="2"
                    />
                    <text
                      x="405"
                      y="125"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Kanal K⁺
                    </text>
                    <text
                      x="405"
                      y="60"
                      fill={
                        actionPotentialPhase === "repolarizing"
                          ? "#34d399"
                          : "#f87171"
                      }
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {actionPotentialPhase === "repolarizing"
                        ? "TERBUKA ✓"
                        : "TERTUTUP"}
                    </text>
                  </g>

                  {/* ION Na+ mengalir jika depolarisasi */}
                  {actionPotentialPhase === "depolarizing" &&
                    comparisonMode === "normal" && (
                      <g>
                        <circle cx="245" cy="40" r="7" fill="#fbbf24" />
                        <text
                          x="245"
                          y="43"
                          fill="#000"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Na⁺
                        </text>
                        {/* Panah Aliran Masuk */}
                        <line
                          x1="245"
                          y1="50"
                          x2="245"
                          y2="190"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                        />
                        <polygon points="240,185 250,185 245,195" fill="#fbbf24" />
                        <text
                          x="245"
                          y="210"
                          fill="#fbbf24"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Na⁺ Masuk (Depolarisasi)
                        </text>
                      </g>
                    )}

                  {/* ION K+ mengalir keluar jika repolarisasi */}
                  {actionPotentialPhase === "repolarizing" &&
                    comparisonMode === "normal" && (
                      <g>
                        <circle cx="405" cy="190" r="7" fill="#c084fc" />
                        <text
                          x="405"
                          y="193"
                          fill="#000"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          K⁺
                        </text>
                        {/* Panah Aliran Keluar */}
                        <line
                          x1="405"
                          y1="180"
                          x2="405"
                          y2="45"
                          stroke="#c084fc"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                        />
                        <polygon points="400,50 410,50 405,40" fill="#c084fc" />
                        <text
                          x="405"
                          y="32"
                          fill="#c084fc"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          K⁺ Keluar (Repolarisasi)
                        </text>
                      </g>
                    )}

                  {/* KONDISI GANGGUAN KANAL ION (Kasus 2 Rusak) */}
                  {comparisonMode === "abnormal" && (
                    <g>
                      <circle cx="245" cy="120" r="16" fill="#f43f5e" opacity="0.4" />
                      <text
                        x="320"
                        y="125"
                        fill="#f43f5e"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ⚠ Kanal Mengalami Gangguan! Perpindahan Ion Terhambat
                      </text>
                    </g>
                  )}

                  {/* Mini Kurva Potensial Aksi di Pojok Kanan */}
                  <g transform="translate(480, 50)">
                    <rect
                      x="0"
                      y="0"
                      width="150"
                      height="130"
                      rx="8"
                      fill="#0f172a"
                      stroke="#334155"
                    />
                    <text x="10" y="20" fill="#94a3b8" fontSize="9" fontWeight="bold">
                      Potensial Membran (mV)
                    </text>
                    <line x1="20" y1="30" x2="20" y2="115" stroke="#475569" />
                    <line x1="20" y1="100" x2="140" y2="100" stroke="#475569" strokeDasharray="2 2" />
                    <text x="25" y="103" fill="#64748b" fontSize="8">
                      -70 mV (Istirahat)
                    </text>
                    <text x="25" y="45" fill="#f59e0b" fontSize="8">
                      +30 mV (Puncak)
                    </text>

                    {/* Kurva Grafik */}
                    <path
                      d="M 20 100 Q 50 100, 65 90 T 80 40 T 100 110 T 135 100"
                      fill="none"
                      stroke={comparisonMode === "normal" ? "#38bdf8" : "#f43f5e"}
                      strokeWidth="2.5"
                    />
                    {/* Marker posisi waktu */}
                    <circle
                      cx={20 + impulseProgress * 115}
                      cy={
                        actionPotentialPhase === "depolarizing"
                          ? 40
                          : actionPotentialPhase === "repolarizing"
                          ? 90
                          : 100
                      }
                      r="4"
                      fill="#facc15"
                    />
                  </g>
                </svg>

                <div className="w-full mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-zinc-300 font-medium">
                      Fase Saat Ini:{" "}
                      <strong className="text-white uppercase tracking-wider">
                        {actionPotentialPhase === "resting"
                          ? "Polarisasi / Istirahat (-70 mV)"
                          : actionPotentialPhase === "depolarizing"
                          ? "Depolarisasi (Na⁺ Masuk Membran)"
                          : "Repolarisasi (K⁺ Keluar Membran)"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- KASUS 3: KOMUNIKASI SINAPSIS & NEUROTRANSMITER ----------------- */}
            {selectedCaseId === "kasus-3" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs text-zinc-400 mb-2 px-2">
                  <span className="font-bold text-sky-400">
                    Terminal Prasinaptik (Neuron Pengirim)
                  </span>
                  <span className="font-bold text-amber-400">
                    Celah Sinapsis (Synaptic Cleft)
                  </span>
                  <span className="font-bold text-emerald-400">
                    Membran Pascasinaptik (Penerima)
                  </span>
                </div>

                <svg viewBox="0 0 650 240" className="w-full h-auto">
                  {/* Ujung Akson Terminal Prasinaptik (Kiri) */}
                  <path
                    d="M 0 40 L 160 40 C 230 40, 230 200, 160 200 L 0 200 Z"
                    fill="#0369a1"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Terminal Prasinaptik: Mengandung vesikel sinaptik yang menyimpan neurotransmiter. Ketika potensial aksi tiba, vesikel melebur dan melepaskan isinya."
                      )
                    }
                  />
                  <text x="40" y="125" fill="#bae6fd" fontSize="11" fontWeight="bold">
                    Akson Terminal
                  </text>

                  {/* Vesikel Sinapsis berisi Neurotransmiter */}
                  {[
                    { cx: 130, cy: 80 },
                    { cx: 160, cy: 110 },
                    { cx: 140, cy: 150 },
                    { cx: 175, cy: 85 },
                    { cx: 180, cy: 140 },
                  ].map((v, i) => (
                    <g key={i}>
                      <circle cx={v.cx} cy={v.cy} r="14" fill="#0284c7" stroke="#38bdf8" />
                      <circle cx={v.cx - 4} cy={v.cy - 3} r="3" fill="#4ade80" />
                      <circle cx={v.cx + 4} cy={v.cy + 3} r="3" fill="#4ade80" />
                      <circle cx={v.cx} cy={v.cy + 4} r="3" fill="#4ade80" />
                    </g>
                  ))}

                  {/* Celah Sinapsis (Area Tengah) */}
                  <rect x="235" y="20" width="160" height="200" fill="none" />
                  <text
                    x="315"
                    y="35"
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Celah Sinapsis (20-40 nm)
                  </text>

                  {/* Molekul Neurotransmiter yang dilepaskan ke celah */}
                  {comparisonMode === "normal" ? (
                    // Pelepasan Normal: Banyak molekul hijau bergerak
                    [
                      { x: 240 + impulseProgress * 140, y: 80 },
                      { x: 230 + impulseProgress * 150, y: 110 },
                      { x: 235 + impulseProgress * 135, y: 140 },
                      { x: 250 + impulseProgress * 125, y: 165 },
                      { x: 220 + impulseProgress * 160, y: 95 },
                    ].map((nt, idx) => (
                      <g key={idx}>
                        <circle cx={nt.x} cy={nt.y} r="5" fill="#4ade80" />
                        <circle cx={nt.x} cy={nt.y} r="8" fill="#4ade80" opacity="0.3" />
                      </g>
                    ))
                  ) : (
                    // Pelepasan Terganggu: Neurotransmiter macet / sedikit
                    <g>
                      <circle cx="235" cy="120" r="4" fill="#fb7185" />
                      <text
                        x="315"
                        y="125"
                        fill="#f43f5e"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ⚠ Gangguan Pelepasan: Neurotransmiter Kurang!
                      </text>
                    </g>
                  )}

                  {/* Membran Pascasinaptik (Kanan) */}
                  <path
                    d="M 430 40 C 370 40, 370 200, 430 200 L 650 200 L 650 40 Z"
                    fill="#065f46"
                    stroke="#34d399"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Membran Pascasinaptik: Memiliki reseptor spesifik yang mengikat neurotransmiter untuk membuka kanal ion dan meneruskan impuls."
                      )
                    }
                  />
                  <text x="500" y="125" fill="#a7f3d0" fontSize="11" fontWeight="bold">
                    Neuron Target / Pascasinaptik
                  </text>

                  {/* Reseptor-reseptor di membran kanan */}
                  {[75, 115, 155].map((ry, idx) => (
                    <g key={idx}>
                      <rect x="382" y={ry} width="16" height="24" rx="4" fill="#10b981" />
                      <circle cx="390" cy={ry + 12} r="5" fill="#047857" />
                    </g>
                  ))}
                </svg>

                <div className="w-full mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-300 font-medium">
                      {comparisonMode === "normal"
                        ? "Transmisi Kimiawi Normal: Neurotransmiter melintasi celah dan mengikat reseptor pascasinaptik."
                        : "Kasus 3 Terganggu: Kurangnya neurotransmiter membuat sinyal tidak tersampaikan ke sel target!"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- KASUS 4: SADAR VS REFLEKS ----------------- */}
            {selectedCaseId === "kasus-4" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs text-zinc-400 mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Flame className="w-4 h-4" />
                    Stimulus Panas (Jari Tangan)
                  </span>
                  <span className="font-bold text-indigo-400">
                    Jalur Lengkung Refleks vs Jalur Sadar
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Brain className="w-4 h-4" />
                    Korteks Otak Besar
                  </span>
                </div>

                <svg viewBox="0 0 650 240" className="w-full h-auto">
                  {/* Titik 1: Rangsangan Panas di Kulit Jari */}
                  <g
                    transform="translate(40, 140)"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Reseptor Kulit (Sensorik): Mendeteksi suhu panas tinggi dan segera memicu potensial aksi pada neuron sensorik."
                      )
                    }
                  >
                    <rect x="0" y="0" width="70" height="50" rx="8" fill="#e11d48" />
                    <text x="35" y="22" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Ujung Jari
                    </text>
                    <text x="35" y="38" fill="#fecdd3" fontSize="8" textAnchor="middle">
                      (Panas 🔥)
                    </text>
                  </g>

                  {/* Jalur Neuron Sensorik (Biru) menuju Sumsum Tulang Belakang */}
                  <path
                    d="M 110 165 C 180 165, 200 130, 260 130"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeDasharray="4 2"
                  />
                  <text x="175" y="145" fill="#38bdf8" fontSize="9" fontWeight="bold">
                    Neuron Sensorik
                  </text>

                  {/* Titik 2: Sumsum Tulang Belakang (Medula Spinalis) */}
                  <g
                    transform="translate(260, 90)"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedElementInfo(
                        "Sumsum Tulang Belakang: Pusat integrasi lengkung refleks. Interneuron langsung menghubungkan neuron sensorik ke neuron motorik tanpa menunggu instruksi sadar otak!"
                      )
                    }
                  >
                    <rect x="0" y="0" width="110" height="90" rx="14" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                    <text x="55" y="30" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Medula Spinalis
                    </text>
                    <text x="55" y="45" fill="#94a3b8" fontSize="8" textAnchor="middle">
                      (Sumsum Tulang Blkg)
                    </text>

                    {/* Interneuron Refleks (Hijau) */}
                    <circle cx="55" cy="65" r="8" fill="#10b981" />
                    <text x="55" y="80" fill="#a7f3d0" fontSize="7" textAnchor="middle">
                      Interneuron
                    </text>
                  </g>

                  {/* Jalur Lengkung Refleks Cepat (Merah) dari Medula ke Otot */}
                  <path
                    d="M 315 155 C 380 180, 440 180, 520 180"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4"
                  />
                  <text x="390" y="195" fill="#f43f5e" fontSize="9" fontWeight="bold">
                    Neuron Motorik (Refleks Cepat ~30ms)
                  </text>

                  {/* Otot Bisep / Efektor Penarik Tangan */}
                  <g transform="translate(520, 150)">
                    <rect x="0" y="0" width="90" height="50" rx="8" fill="#b91c1c" />
                    <text x="45" y="24" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Otot Bisep
                    </text>
                    <text x="45" y="38" fill="#fca5a5" fontSize="8" textAnchor="middle">
                      Tangan Ditarik!
                    </text>
                  </g>

                  {/* Jalur Gerak Sadar: Naik ke Otak Besar */}
                  <path
                    d="M 315 100 C 340 50, 420 30, 480 30"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                  <text x="360" y="40" fill="#c084fc" fontSize="9" fontWeight="bold">
                    Jalur Sadar ke Otak (~250ms)
                  </text>

                  {/* Otak Besar (Korteks Motorik) */}
                  <g transform="translate(480, 15)">
                    <rect x="0" y="0" width="130" height="45" rx="8" fill="#6b21a8" stroke="#c084fc" strokeWidth="1.5" />
                    <text x="65" y="22" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Otak Besar (Sadar)
                    </text>
                    <text x="65" y="36" fill="#e9d5ff" fontSize="8" textAnchor="middle">
                      (Ambil buku, keputusan)
                    </text>
                  </g>

                  {/* Partikel sinyal bergerak sesuai progress */}
                  {(() => {
                    // Refleks loop
                    const px = 110 + impulseProgress * (520 - 110);
                    return (
                      <circle
                        cx={px}
                        cy={px < 315 ? 140 : 175}
                        r="6"
                        fill="#facc15"
                        className="animate-ping"
                      />
                    );
                  })()}
                </svg>

                <div className="w-full mt-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span className="text-zinc-300 font-medium">
                      Perbedaan: <strong>Gerak Refleks</strong> memotong langsung di sumsum tulang belakang (menyelamatkan tangan dari api dalam hitungan milidetik), sedangkan <strong>Gerak Sadar</strong> harus diproses dulu oleh Otak Besar.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- KASUS 5: INTEGRASI SISTEM SARAF LENGKAP ----------------- */}
            {selectedCaseId === "kasus-5" && (
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs text-zinc-400 mb-2 px-2">
                  <span className="text-indigo-400 font-bold">
                    Peta Terpadu Integrasi Respons Saraf
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Klik komponen untuk menginspeksi
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {[
                    {
                      title: "1. Rangsangan (Reseptor)",
                      desc: "Menerima stimulus sensorik & memicu potensial aksi.",
                      color: "border-sky-500 bg-sky-950/40 text-sky-300",
                    },
                    {
                      title: "2. Akson & Mielin",
                      desc: "Menghantarkan impuls secara cepat lewat konduksi saltatori.",
                      color: "border-amber-500 bg-amber-950/40 text-amber-300",
                    },
                    {
                      title: "3. Transmisi Sinapsis",
                      desc: "Neurotransmiter meneruskan sinyal kimiawi ke neuron berikutnya.",
                      color: "border-emerald-500 bg-emerald-950/40 text-emerald-300",
                    },
                    {
                      title: "4. Respons Efektor",
                      desc: "Otot berkontraksi menghasilkan gerakan terkoordinasi.",
                      color: "border-purple-500 bg-purple-950/40 text-purple-300",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedElementInfo(`${card.title}: ${card.desc}`)}
                      className={`p-3 rounded-xl border ${card.color} cursor-pointer transition-all hover:scale-105 hover:brightness-110 flex flex-col justify-between`}
                    >
                      <h4 className="text-xs font-bold mb-1">{card.title}</h4>
                      <p className="text-[11px] text-zinc-300 leading-snug">
                        {card.desc}
                      </p>
                      <div className="mt-2 flex items-center justify-end text-[10px] text-zinc-400">
                        <span>Detail &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full mt-4 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                  <p>
                    💡 <strong>Prinsip Investigasi Ilmiah:</strong> Jika respons tubuh seseorang melambat, kita tidak boleh langsung menyimpulkan tanpa data. Keterlambatan bisa terjadi di penerima rangsang, konduksi akson mielin, pelepasan sinapsis, maupun kelelahan otot efektor.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= BOX DETAIL PENJELASAN ELEMEN KLIK ================= */}
          {selectedElementInfo ? (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/80 text-xs text-indigo-200 flex items-start gap-2.5 animate-fade-in">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{selectedElementInfo}</p>
              </div>
              <button
                onClick={() => setSelectedElementInfo(null)}
                className="text-indigo-400 hover:text-white text-[11px] font-bold"
              >
                Tutup
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-[11px] text-zinc-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span>
                Tip: Klik pada bagian organel, selubung mielin, atau kanal ion di diagram untuk membaca fungsi biologisnya!
              </span>
            </div>
          )}

          {/* ================= TUJUAN PEMBELAJARAN KASUS ================= */}
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/90 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Skenario Pembelajaran Kasus</span>
            </div>
            <p className="text-zinc-200 leading-relaxed">{currentCase.scenario}</p>
          </div>
        </div>

        {/* ================= FOOTER MODAL ================= */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-900/90 text-xs">
          <span className="text-zinc-500">
            Gunakan tombol <strong>Kondisi Normal / Terganggu</strong> untuk membandingkan gejala.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            Lanjutkan Diskusi Kasus
          </button>
        </div>
      </div>
    </div>
  );
};
