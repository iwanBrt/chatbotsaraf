# Walkthrough: Interactive 3D Roleplay AI Character (Neuron Bot)

Implementasi platform chatbot edukatif berbasis AI dengan karakter avatar 3D interaktif **"Neuron"** telah selesai dibangun sesuai dengan spesifikasi di [CLAUDE.md](file:///d:/neuron-chatbot/CLAUDE.md) dan preferensi pengguna.

---

## 🌟 Fitur & Arsitektur yang Telah Selesai Dibangun

### 1. Sinkronisasi Video Avatar 3D & State Bicara
- **Looping saat Berbicara:** Video avatar [neuron-talk.mp4](file:///d:/neuron-chatbot/public/neuron-talk.mp4) otomatis memutar animasi loop saat suara percakapan dimulai (`utterance.onstart`).
- **Pose Idle di Detik ke-4:** Sesuai permintaan, saat suara selesai (`utterance.onend` / `utterance.onerror`) atau saat pertama kali aplikasi dimuat, video otomatis berhenti dan dikunci pada **detik ke-4 (`video.currentTime = 4; video.pause();`)**.
- **Komponen:** [AvatarStage.tsx](file:///d:/neuron-chatbot/app/components/AvatarStage.tsx)

### 2. Audio & Speech Layer (Web Speech API)
- **Smart Indonesian Voice Picker:** Secara otomatis mendeteksi dan memilih suara Bahasa Indonesia (`id-ID`) terbaik di browser pengguna (Google Bahasa Indonesia, Microsoft Gadis, atau voice sistem).
- **Karakter Suara Kartunis:** Dikonfigurasi dengan `pitch: 1.35` dan `rate: 1.05` untuk menghasilkan suara yang ceria, hidup, dan ramah anak.
- **TTS Text Sanitizer:** Memfilter karakter markdown (`**`, `*`, `#`, bullet points, tag HTML) sebelum dikirim ke mesin suara agar tidak terbaca aneh oleh audio browser.
- **Modul:** [speech.ts](file:///d:/neuron-chatbot/app/utils/speech.ts)

### 3. Backend & AI Layer (Google Gemini 2.0 Flash)
- **Official SDK `@google/genai`:** Menggunakan `GoogleGenAI` dengan model `gemini-2.0-flash`.
- **System Instruction Persona Neuron:** Diatur ketat agar selalu ramah anak, bersemangat (*"Bzzzt!"*, *"Zap!"*, *"Hai Sobat Cerdas!"*), menjawab dalam 2–3 kalimat ringkas bertema sains/tubuh manusia, dan bebas format markdown.
- **Memory Context:** Mengelola riwayat percakapan (*sliding window* 6 pesan terakhir) untuk menjaga konteks obrolan tetap nyambung tanpa boros token.
- **Resilient Fallback:** Memiliki fallback cerdas untuk pertanyaan sains anak jika API key belum diganti atau kuota offline.
- **Endpoint:** [route.ts](file:///d:/neuron-chatbot/app/api/chat/route.ts)

### 4. UI/UX 9:16 Mobile-First Bertema Neural Futuristic
- **Layout Vertikal 9:16:** Terlihat seperti aplikasi native di smartphone dan terpusat rapi dengan latar belakang neural glow di desktop.
- **Audio Unlock Modal:** [WelcomeModal.tsx](file:///d:/neuron-chatbot/app/components/WelcomeModal.tsx) untuk menyapa pengguna pertama kali dan membuka izin audio browser (*browser autoplay policy*).
- **Waveform Visualizer:** [WaveformVisualizer.tsx](file:///d:/neuron-chatbot/app/components/WaveformVisualizer.tsx) yang berdenyut selaras dengan status berbicara Neuron.
- **Interactive Suggestion Chips:** [SuggestionChips.tsx](file:///d:/neuron-chatbot/app/components/SuggestionChips.tsx) untuk pertanyaan cepat satu klik bagi anak-anak.
- **Riwayat Percakapan Modal:** Tombol riwayat untuk membaca ulang transkrip obrolan sebelumnya.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Development Server:**
   ```powershell
   npm run dev
   ```
2. Buka peramban di `http://localhost:3000` (atau port yang aktif).
3. Klik tombol **"⚡ Sapa Neuron & Mulai!"** pada layar pembuka.
4. Neuron akan langsung menyapa dengan suara dan animasi berbicara.
5. Ketik pertanyaan sains di input bawah atau klik salah satu tombol **Tanya Cepat**.

> [!NOTE]
> **Catatan Konfigurasi API Key:**
> Pastikan nilai `GEMINI_API_KEY` di file [.env.local](file:///d:/neuron-chatbot/.env.local) menggunakan kunci API resmi dari [Google AI Studio](https://aistudio.google.com/apikey) (biasanya berawalan `AIzaSy...`). Jika API key belum terpasang atau tidak valid, aplikasi tetap dapat diuji coba dengan respons bawaan bertema sains yang telah disiapkan.
