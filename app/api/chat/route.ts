import { NextRequest, NextResponse } from "next/server";

interface MessageHistoryItem {
  role: "user" | "model";
  content: string;
}

const SYSTEM_INSTRUCTION = `Kamu adalah sistem asisten edukatif anatomi cerdas berbasis AI.
Tugas utamamu adalah merespons pertanyaan siswa dan memilih karakter anatomi yang paling relevan untuk menjawab.

Daftar Karakter yang Tersedia:
- "neuron" (Neuron Asisten Umum - gunakan ini jika pertanyaan bersifat umum atau tidak spesifik ke bagian tertentu)
- "badansel" (Badan Sel)
- "batangotak" (Batang Otak)
- "dendrit" (Dendrit)
- "ganglia" (Ganglia)
- "neurit" (Neurit / Akson)
- "otakbesar" (Otak Besar / Cerebrum)
- "otakkecil" (Otak Kecil / Cerebellum)
- "sarafkranial" (Saraf Kranial)
- "sarafspinal" (Saraf Spinal)
- "sumsum" (Sumsum Tulang Belakang)

ATURAN WAJIB:
1. Jawab dengan profesional, ringkas, maksimal 2-3 kalimat.
2. Gaya bahasa baku, ramah, dan mendidik. JANGAN gunakan emoji atau seruan kekanak-kanakan.
3. JANGAN gunakan markdown seperti ** * # -. Teks ini akan langsung dibacakan oleh suara TTS.
4. Jawab HANYA dalam format JSON valid dengan struktur:
   {
     "character": "id_karakter",
     "reply": "jawaban teks di sini"
   }
5. Pilih id_karakter HANYA dari daftar karakter yang tersedia di atas berdasarkan bagian anatomi mana yang relevan dengan pertanyaan.`;

export async function POST(req: NextRequest) {
  let userMessage = "";
  try {
    const body = await req.json();
    const { message, history = [] } = body as {
      message: string;
      history?: MessageHistoryItem[];
    };
    userMessage = typeof message === "string" ? message : "";

    if (!userMessage || userMessage.trim() === "") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Batasi memori riwayat ke 6 pesan terakhir
    const recentHistory = history.slice(-6);

    // Format pesan sesuai standar OpenAI chat completion
    const messages = [
      { role: "system" as const, content: SYSTEM_INSTRUCTION },
      ...recentHistory.map((item) => ({
        role: item.role === "model" ? ("assistant" as const) : ("user" as const),
        content: item.content,
      })),
      { role: "user" as const, content: userMessage.trim() },
    ];

    let reply = "";
    let character = "neuron";

    // === UTAMA: OpenRouter API dengan google/gemma-4-26b-a4b-it:free ===
    const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (openRouterApiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const openRouterRes = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterApiKey}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Neuron AI Chatbot",
            },
            body: JSON.stringify({
              model: "google/gemma-4-26b-a4b-it:free",
              messages,
              temperature: 0.7,
              max_tokens: 200,
            }),
          }
        );

        clearTimeout(timeoutId);

        if (openRouterRes.ok) {
          const data = await openRouterRes.json();
          let rawContent = data.choices?.[0]?.message?.content || "";
          
          // Bersihkan markdown markdown json jika ada
          rawContent = rawContent.replace(/```json\n?/g, "").replace(/```/g, "").trim();
          
          try {
            const parsed = JSON.parse(rawContent);
            reply = cleanModelOutput(parsed.reply || "");
            character = parsed.character || "neuron";
            console.log("[Chat] OpenRouter OK, character:", character, "reply length:", reply.length);
          } catch (e) {
            console.warn("[Chat] OpenRouter failed to parse JSON:", rawContent);
            reply = cleanModelOutput(rawContent); // Fallback to raw text
          }
        } else {
          const errData = await openRouterRes.json().catch(() => ({}));
          console.warn(`[Chat] OpenRouter HTTP ${openRouterRes.status}:`, errData?.error?.message || "unknown error");
        }
      } catch (orErr) {
        console.warn("[Chat] OpenRouter error/timeout, akan coba fallback:", orErr instanceof Error ? orErr.message : orErr);
      }
    }

    // === FALLBACK: Google Gemini 3.6 Flash via SDK ===
    if (!reply) {
      const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
      if (geminiApiKey) {
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });

          // Bangun prompt lengkap: system + history + user message
          const historyText = recentHistory
            .map((item) =>
              item.role === "user"
                ? `Anak bertanya: ${item.content}`
                : `Neuron menjawab: ${item.content}`
            )
            .join("\n");

          const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${historyText ? historyText + "\n\n" : ""}Anak bertanya: ${userMessage.trim()}\n\nJawab sebagai Neuron:`;

          const geminiRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: fullPrompt,
            config: {
              responseMimeType: "application/json",
            }
          });

          const rawGemini = geminiRes.text?.trim() || "";
          if (rawGemini) {
            try {
              const parsed = JSON.parse(rawGemini);
              reply = cleanModelOutput(parsed.reply || "");
              character = parsed.character || "neuron";
              console.log("[Chat] Gemini SDK OK, character:", character, "reply length:", reply.length);
            } catch (e) {
              console.warn("[Chat] Gemini failed to parse JSON:", rawGemini);
              reply = cleanModelOutput(rawGemini);
            }
          }
        } catch (gemErr) {
          console.warn("[Chat] Gemini fallback gagal:", gemErr instanceof Error ? gemErr.message : gemErr);
        }
      }
    }

    if (!reply) {
      reply = "Koneksi ke server terputus. Silakan ajukan pertanyaan Anda kembali.";
      character = "neuron";
    }

    return NextResponse.json({ reply, character });
  } catch (error: unknown) {
    console.error("Error generating response:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";

    // Fallback jawaban edukatif offline
    const lowerQuery = userMessage.toLowerCase();
    let fallbackReply = "Koneksi ke server terputus. Silakan ajukan pertanyaan Anda kembali.";

    if (lowerQuery.includes("berpikir") || lowerQuery.includes("pikir")) {
      fallbackReply = "Proses berpikir terjadi karena miliaran sel saraf di otak saling mengirimkan sinyal listrik dengan sangat cepat setiap detik.";
    } else if (lowerQuery.includes("sel saraf") || lowerQuery.includes("neuron") || lowerQuery.includes("di mana") || lowerQuery.includes("bagian tubuh")) {
      fallbackReply = "Sel saraf tersebar di seluruh bagian tubuh manusia, mulai dari otak, sumsum tulang belakang, hingga ke ujung ekstremitas seperti jari tangan dan kaki.";
    } else if (lowerQuery.includes("mimpi") || lowerQuery.includes("tidur")) {
      fallbackReply = "Saat tidur, otak memproses dan mengkonsolidasi informasi serta ingatan yang terjadi sepanjang hari. Aktivitas saraf ini yang kita kenal sebagai fenomena mimpi.";
    }

    return NextResponse.json({ warning: "Fallback mode.", error: errorMessage, reply: fallbackReply, character: "neuron" }, { status: 200 });
  }
}

/** Bersihkan output reasoning/thinking yang bocor dari model */
function cleanModelOutput(text: string): string {
  if (!text) return "";
  let cleaned = text;

  // Hapus <think>...</think> tags
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Hapus blok reasoning bernomor di awal (contoh: "1. **Analyze User Input:** ...")
  // Deteksi: jika teks diawali angka + bold markdown, kemungkinan besar itu reasoning
  // Deteksi jika ada sisa sapaan anak-anak yang mungkin masih terbawa
  const neuronStart = cleaned.search(/(?:Halo|Hai\s|Selamat)/i);
  if (neuronStart > 50) {
    // Ada teks panjang sebelum sapaan Neuron = kemungkinan reasoning bocor
    cleaned = cleaned.substring(neuronStart);
  }

  // Hapus "Here's a thinking process:" dan sejenisnya
  cleaned = cleaned.replace(/^Here's a thinking process:[\s\S]*?\n\n/gi, "");
  cleaned = cleaned.replace(/^\*\*Thinking Process:\*\*[\s\S]*?\n\n/gi, "");

  // Hapus markdown residual
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");

  return cleaned.trim();
}
