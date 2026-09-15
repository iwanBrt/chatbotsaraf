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

// Mencari suara Bahasa Indonesia terbaik yang tersedia di browser
export function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Cari yang persis 'id-ID' atau 'id_ID'
  const idVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().replace("_", "-") === "id-id" ||
      v.lang.toLowerCase().startsWith("id")
  );

  if (idVoices.length > 0) {
    // Utamakan Google Bahasa Indonesia atau Microsoft Gadis
    const preferred = idVoices.find(
      (v) =>
        v.name.toLowerCase().includes("google") ||
        v.name.toLowerCase().includes("gadis") ||
        v.name.toLowerCase().includes("indonesia")
    );
    return preferred || idVoices[0];
  }

  // Fallback: gunakan default sistem jika bahasa Indonesia belum terunduh
  return voices.find((v) => v.default) || voices[0] || null;
}

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
  pitch?: number;
  rate?: number;
}

// Reference global untuk mencegah Garbage Collection dini oleh browser Chrome (V8 GC bug)
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

  const sanitized = sanitizeForTTS(text);
  if (!sanitized) {
    options.onEnd?.();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(sanitized);
  activeUtterance = utterance;

  const voice = getIndonesianVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "id-ID";
  }

  // Konfigurasi vokal kartunis khas Neuron
  utterance.pitch = options.pitch ?? 1.35;
  utterance.rate = options.rate ?? 1.05;

  let hasStarted = false;

  utterance.onstart = () => {
    hasStarted = true;
    options.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Error 'interrupted' atau 'canceled' adalah hal wajar saat user menimpa pembicaraan
    if (e.error === "interrupted" || e.error === "canceled") {
      activeUtterance = null;
      return;
    }

    console.warn(`Speech synthesis error [${e.error}]:`, e);
    activeUtterance = null;
    options.onError?.(e);
    options.onEnd?.();
  };

  // Di Chromium, penundaan kecil (~60ms) setelah cancel() sangat penting
  // agar browser menyelesaikan state cancellation sebelum memutar utterance baru.
  speechTimeoutId = setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Gagal menjalankan speak():", err);
      options.onEnd?.();
    }
  }, 60);

  return utterance;
}

export function stopNeuronSpeech(): void {
  if (speechTimeoutId) {
    clearTimeout(speechTimeoutId);
    speechTimeoutId = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    activeUtterance = null;
    window.speechSynthesis.cancel();
  }
}
