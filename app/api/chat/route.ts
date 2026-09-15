import { NextRequest, NextResponse } from "next/server";

interface MessageHistoryItem {
  role: "user" | "model";
  content: string;
}

const SYSTEM_INSTRUCTION = `Kamu adalah "Neuron", asisten edukatif anatomi cerdas berbasis AI.
Tugas utamamu adalah menjadi pendamping pembelajaran sains dan biologi yang profesional, akurat, dan mudah dipahami.

ATURAN WAJIB:
1. Jawab pertanyaan dengan profesional, ringkas, dan sangat informatif.
2. Gunakan gaya bahasa baku namun mudah dicerna (ed-tech style).
3. JANGAN PERNAH menggunakan istilah kekanak-kanakan, emoji, atau seruan berlebihan (seperti Bzzzt, Zap).
4. Panjang jawaban HARUS ringkas, maksimal 2 hingga 3 kalimat saja.
5. JANGAN PERNAH gunakan format markdown seperti ** * # - atau tautan URL. Teks akan dibacakan langsung oleh suara audio.
6. Jawab dalam Bahasa Indonesia yang sopan dan terstruktur.
7. JANGAN sertakan proses berpikir, analisis, atau reasoning di jawabanmu. Langsung berikan jawaban akhir!
8. Jika ditanya hal di luar sains/tubuh manusia, arahkan kembali dengan profesional ke topik anatomi.`;

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
          const rawContent = data.choices?.[0]?.message?.content || "";
          reply = cleanModelOutput(rawContent);
          console.log("[Chat] OpenRouter OK, reply length:", reply.length);
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
          });

          const rawGemini = geminiRes.text?.trim() || "";
          if (rawGemini) {
            reply = cleanModelOutput(rawGemini);
            console.log("[Chat] Gemini SDK OK, reply length:", reply.length);
          }
        } catch (gemErr) {
          console.warn("[Chat] Gemini fallback gagal:", gemErr instanceof Error ? gemErr.message : gemErr);
        }
      }
    }

    if (!reply) {
      reply = "Koneksi ke server terputus. Silakan ajukan pertanyaan Anda kembali.";
    }

    return NextResponse.json({ reply });
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

    return NextResponse.json({ warning: "Fallback mode.", error: errorMessage, reply: fallbackReply }, { status: 200 });
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
