@AGENTS Agent Specification: Interactive 3D Roleplay AI Character (Neuron Bot)

## 1. Project Overview & Vision
Proyek ini bertujuan untuk membangun sebuah platform chatbot interaktif roleplay edukatif berbasis AI yang dirancang khusus untuk anak-anak. Berbeda dengan chatbot teks konvensional, aplikasi ini menyajikan karakter avatar 3D interaktif bernama **"Neuron"** (sel saraf biologis yang ceria dan futuristik). Ketika pengguna mengajukan pertanyaan, karakter akan merespons secara langsung melalui suara percakapan alami (*voice speech*) yang disinkronisasikan dengan video animasi berbicara (*lip-sync loop effect*), menciptakan pengalaman interaksi interaktif layaknya sedang berbicara langsung dengan persona virtual (seperti *Rudy pada Grok AI*).

---

## 2. Core Personas & Character Design
* **Nama Karakter:** Neuron (The Friendly Brain Cell)
* **Visual Identity:** - Sel saraf 3D berwarna biru cerah dengan tekstur semitransparan futuristik.
  - Memiliki dendrit/akson yang ekspresif menyerupai rambut & kaki yang dinamis.
  - Ekspresi wajah ramah anak, mata besar berbinar, dan senyum antusias.
* **Tone of Voice:**
  - Ceria, bersemangat, penuh rasa ingin tahu, dan menggunakan analogi ramah anak.
  - Sering memakai kata ekspresi seperti *"Bzzzt!"*, *"Zap!"*, *"Hai Sobat Kecil!"*.
  - Menjelaskan konsep biologis dan sains tubuh manusia secara sederhana dan mudah dipahami tanpa bahasa medis yang kaku.

---

## 3. Technology Stack & Architecture

### A. Frontend Layer
* **Framework:** Next.js (React 19 / App Router) dengan TypeScript.
* **Styling:** Tailwind CSS (Modern Glassmorphism & Soft Child-Friendly Palettes).
* **Iconography & UI Components:** Lucide React icons.
* **Media Handling:** HTML5 `<video>` Controller dengan state-based play/pause loop synchronization.

### B. Artificial Intelligence & Backend Layer
* **LLM Engine:** Google Gemini API (`gemini-2.0-flash`) via `@google/genai` SDK resmi.
* **Prompt Engineering:** Strict system instruction untuk menjaga respons tetap ringkas (2-3 kalimat), ramah anak, dan bebas dari format markdown yang mengganggu pembacaan suara.
* **Environment:** Next.js API Routes / Edge Handler dengan proteksi API Key environment variable.

### C. Voice & Audio Layer
* **Speech Synthesis (TTS):** Web Speech API (`SpeechSynthesisUtterance`) bawaan browser (bahasa `id-ID` dengan konfigurasi *pitch* tinggi untuk kesan kartunis yang hidup).
* **Audio-Video State Sync:** Event listener `onstart`, `onend`, dan `onerror` untuk sinkronisasi runtime pemutaran video avatar secara real-time.

---

## 4. System Workflow & Data Flow

1. **User Input:** Anak mengetik pertanyaan di input bar bagian bawah layar.
2. **Backend Processing:**
   - Input dikirim via `POST /api/chat`.
   - Backend memproses pesan ke Google Gemini 2.0 Flash dengan *system instruction persona*.
   - Gemini mengembalikan respons teks pendek bertema sains anak.
3. **Voice & Visual Trigger:**
   - Frontend menerima respons teks dan memulai `speechSynthesis.speak()`.
   - Event `onstart` memicu elemen video 3D avatar untuk mulai berputar (`play()` loop).
   - Efek suara gelombang audio (waveform visualizer) aktif di layar.
4. **Completion & Idle State:**
   - Ketika suara selesai (`onend`), video avatar otomatis di-*pause* dan dikembalikan ke pose netral/idle.
   - Kotak dialog menampilkan ringkasan teks jawaban.

---

## 5. UI/UX Layout Specification
* **Screen Aspect Ratio:** Mobile-first vertical view (9:16 layout).
* **Top Header:** Indikator status koneksi karakter (Online/Active pulse) dan branding aplikasi.
* **Center Section (Main Stage):**
  - Kotak frame avatar 3D interaktif yang dominan di tengah layar.
  - Overlay floating badge audio status saat suara sedang diputar.
  - Bubble teks minimalis untuk menampilkan transkripsi respons terkini.
* **Bottom Section:** Input bar mengambang (*floating search/chat input*) dengan tombol kirim dan aksen tombol mikrofon.

---

## 6. Project Milestones & Deliverables

| Fase | Target Deliverable | Status |
| :--- | :--- | :--- |
| **Fase 1** | Konseptualisasi Karakter, Moodboard UI & 3D Character Asset Generation | Selesai |
| **Fase 2** | Pembuatan Video Looping Bicara 9:16 untuk Lip-Sync Avatar | Selesai |
| **Fase 3** | Setup Project Next.js, Routing, & Integrasi Gemini API (`@google/genai`) | Selesai |
| **Fase 4** | Integrasi Web Speech API & State Synchronization Audio-Video | Selesai |
| **Fase 5** | Penyempurnaan UI/UX, Animasi Waveform Interaktif, & Fitur Voice Input (STT) | Tahap Lanjutan |

---

## 7. Expected Goals & Outcomes
* **Zero Latency Voice Response:** Respon suara yang cepat dan ringan tanpa biaya API pihak ketiga tambahan untuk TTS.
* **Engaging Child-Centric Experience:** Anak-anak merasa berinteraksi dengan figur hidup berkat animasi bibir dan gerakan tubuh yang tersinkronisasi.
* **Accurate & Safe Knowledge:** Model AI hanya memberikan konten edukatif yang aman (*safe for kids*), positif, dan mendidik.
* **Scalable Architecture:** Kemudahan menambahkan karakter roleplay baru (misalnya sel darah merah, enzim, dll.) hanya dengan mengganti asset video dan system instruction..md
