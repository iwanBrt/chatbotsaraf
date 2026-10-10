/**
 * Utility functions for Speech Synthesis (TTS) and voice cleanup.
 * Dilengkapi proteksi Chrome GC bug, autoplay expiration handling, dan sinkronisasi audio-video.
 */

// Bersihkan teks sebelum dikirim ke Web Speech API
export function sanitizeForTTS(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Hapus reasoning atau thinking section jika model mengembalikannya
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/Here's a thinking process:[\s\S]*?\n\n/gi, "");

  // Hapus markdown formatting: bold (**teks**), italic (*teks* atau _teks_)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");

  // Hapus header markdown (### Header)
  cleaned = cleaned.replace(/#{1,6}\s+/g, "");

  // Hapus bullet points atau list
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, "");
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, "");

  // Hapus markdown link [label](url) -> label
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Hapus tag HTML jika ada
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // Hapus backtick code ( `code` )
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Bersihkan tanda seru atau tanya berlebihan
  cleaned = cleaned.replace(/!{2,}/g, "!");
  cleaned = cleaned.replace(/\?{2,}/g, "?");

  // Hapus simbol karakter tertentu yang aneh dibaca TTS
  cleaned = cleaned.replace(/[~^|\\/]/g, " ");

  // Rapikan whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

const VOICE_STORAGE_KEY = "neuron-voice-name";

// Pengaturan suara natural (tidak kartunis)
export const DEFAULT_PITCH = 1.05;
export const DEFAULT_RATE = 0.95;

function isIndonesian(v: SpeechSynthesisVoice): boolean {
  const lang = v.lang.toLowerCase().replace("_", "-");
  return lang === "id-id" || lang.startsWith("id");
}

/**
 * Skor kualitas suara: utamakan suara Neural/Natural/Online (paling manusiawi),
 * lalu suara perempuan (Gadis, Google Bahasa Indonesia).
 */
function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let score = 0;
  if (name.includes("natural") || name.includes("neural")) score += 100;
  if (name.includes("online")) score += 50;
  if (name.includes("gadis")) score += 40; // Microsoft Gadis (perempuan)
  if (name.includes("google")) score += 30; // Google Bahasa Indonesia (perempuan)
  if (name.includes("damayanti")) score += 25; // Apple (perempuan)
  if (name.includes("ardi") || name.includes("andika")) score += 5; // laki-laki
  if (!v.localService) score += 10; // suara cloud biasanya lebih halus
  return score;
}

/** Daftar suara Bahasa Indonesia, diurutkan dari yang paling manusiawi */
export function getIndonesianVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices() || [];
  return voices.filter(isIndonesian).sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

export function getSavedVoiceName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(VOICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSavedVoiceName(name: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (name) window.localStorage.setItem(VOICE_STORAGE_KEY, name);
    else window.localStorage.removeItem(VOICE_STORAGE_KEY);
  } catch {
    // abaikan (mode privat, dsb.)
  }
}

// Mencari suara Bahasa Indonesia terbaik yang tersedia di browser
export function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Suara pilihan pengguna (disimpan di localStorage)
  const savedName = getSavedVoiceName();
  if (savedName) {
    const saved = voices.find((v) => v.name === savedName);
    if (saved) return saved;
  }

  // 2. Suara Bahasa Indonesia terbaik berdasarkan skor
  const idVoices = getIndonesianVoices();
  if (idVoices.length > 0) return idVoices[0];

  // Fallback: gunakan default sistem jika bahasa Indonesia belum terunduh
  return voices.find((v) => v.default) || voices[0] || null;
}

/** Pecah teks per kalimat agar intonasi lebih alami & menghindari bug Chrome (berhenti setelah ~15 detik) */
function splitIntoChunks(text: string, maxLen = 180): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if ((current + " " + s).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
  pitch?: number;
  rate?: number;
}

// Reference global untuk mencegah Garbage Collection dini oleh browser Chrome (V8 GC bug)
let activeUtterances: SpeechSynthesisUtterance[] = [];
let speechTimeoutId: ReturnType<typeof setTimeout> | null = null;
let speechSessionId = 0;

export function speakNeuronSpeech(
  text: string,
  options: SpeakOptions = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis API tidak didukung di peramban ini.");
    options.onEnd?.();
    return null;
  }

  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }

  // Bangunkan queue speechSynthesis di Chrome jika sedang pause/dormant
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Hentikan suara yang sedang berjalan sebelumnya
  window.speechSynthesis.cancel();
  const sessionId = ++speechSessionId;

  const sanitized = sanitizeForTTS(text);
  if (!sanitized) {
    options.onEnd?.();
    return null;
  }

  const voice = getIndonesianVoice();
  const chunks = splitIntoChunks(sanitized);

  const utterances = chunks.map((chunk, index) => {
    const u = new SpeechSynthesisUtterance(chunk);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = "id-ID";
    }
    // Suara natural seperti guru (bukan kartun)
    u.pitch = options.pitch ?? DEFAULT_PITCH;
    u.rate = options.rate ?? DEFAULT_RATE;

    const isFirst = index === 0;
    const isLast = index === chunks.length - 1;

    if (isFirst) {
      u.onstart = () => {
        if (sessionId === speechSessionId) options.onStart?.();
      };
    }

    if (isLast) {
      u.onend = () => {
        if (sessionId !== speechSessionId) return;
        activeUtterances = [];
        options.onEnd?.();
      };
    }

    u.onerror = (e) => {
      // Error 'interrupted' atau 'canceled' adalah hal wajar saat user menimpa pembicaraan
      if (e.error === "interrupted" || e.error === "canceled") return;
      if (sessionId !== speechSessionId) return;

      console.warn(`Speech synthesis error [${e.error}]:`, e);
      activeUtterances = [];
      options.onError?.(e);
      options.onEnd?.();
    };

    return u;
  });

  activeUtterances = utterances;

  // Di Chromium, penundaan kecil (~60ms) setelah cancel() sangat penting
  // agar browser menyelesaikan state cancellation sebelum memutar utterance baru.
  speechTimeoutId = setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      utterances.forEach((u) => window.speechSynthesis.speak(u));
    } catch (err) {
      console.warn("Gagal menjalankan speak():", err);
      options.onEnd?.();
    }
  }, 60);

  return utterances[0] || null;
}

export function stopNeuronSpeech(): void {
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechSessionId++;
    activeUtterances = [];
    window.speechSynthesis.cancel();
  }
}
