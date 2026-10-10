import { NextRequest, NextResponse } from "next/server";
import { LEARNING_CASES, LearningCase, DialogStep } from "@/app/data/learningCases";

interface MessageHistoryItem {
  role: "user" | "model";
  content: string;
}

export async function POST(req: NextRequest) {
  let userMessage = "";
  let currentCharacter = "neuron";
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      phase = "idle",
      currentCharacter: reqCharacter = "neuron",
      caseId,
      stepNumber = 1,
    } = body as {
      message: string;
      history?: MessageHistoryItem[];
      phase?: string;
      currentCharacter?: string;
      caseId?: string;
      stepNumber?: number;
    };
    userMessage = typeof message === "string" ? message : "";
    if (typeof reqCharacter === "string" && reqCharacter) {
      currentCharacter = reqCharacter;
    }

    if (!userMessage || userMessage.trim() === "") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Batasi memori riwayat ke 6 pesan terakhir
    const recentHistory = history.slice(-6);

    // =========================================================================
    // PRIORITAS 1: Naskah Pembelajaran Berbasis Kasus (update.md)
    // =========================================================================
    // 1. Cek jika permintaan adalah untuk MEMULAI salah satu dari 5 Kasus:
    const lowerMsg = userMessage.toLowerCase();
    const matchedInitialCase =
      LEARNING_CASES.find((c) => c.id === caseId) ||
      LEARNING_CASES.find((c) => lowerMsg.includes(c.id.toLowerCase())) ||
      LEARNING_CASES.find((c) => lowerMsg.includes(c.title.toLowerCase())) ||
      (lowerMsg.includes("andi") ? LEARNING_CASES[0] : undefined) ||
      (lowerMsg.includes("doni") ? LEARNING_CASES[1] : undefined) ||
      (lowerMsg.includes("budi") ? LEARNING_CASES[2] : undefined) ||
      (lowerMsg.includes("rina") ? LEARNING_CASES[3] : undefined) ||
      (lowerMsg.includes("bayu") ? LEARNING_CASES[4] : undefined) ||
      (lowerMsg.includes("kasus 1") ? LEARNING_CASES[0] : undefined) ||
      (lowerMsg.includes("kasus 2") ? LEARNING_CASES[1] : undefined) ||
      (lowerMsg.includes("kasus 3") ? LEARNING_CASES[2] : undefined) ||
      (lowerMsg.includes("kasus 4") ? LEARNING_CASES[3] : undefined) ||
      (lowerMsg.includes("kasus 5") ? LEARNING_CASES[4] : undefined);

    const isStartingCase =
      userMessage.startsWith("Mulai kasus:") ||
      userMessage.startsWith("Saya ingin membahas kasus:") ||
      userMessage.startsWith("Saya ingin membahas topik:") ||
      userMessage.startsWith("Pilih kasus:") ||
      (matchedInitialCase && phase === "topic_selection");

    if (matchedInitialCase && isStartingCase) {
      const step1 = matchedInitialCase.steps[0];
      return NextResponse.json({
        reply: step1.chatbotQuestion,
        character: matchedInitialCase.character,
        caseId: matchedInitialCase.id,
        stepNumber: 1,
        totalSteps: matchedInitialCase.steps.length,
        stepTitle: step1.title,
        roleName: matchedInitialCase.roleName,
        isCompleted: false,
      });
    }

    // 2. Cek jika sesi sedang dalam kasus aktif (update.md role-play):
    const activeCase = LEARNING_CASES.find((c) => c.id === caseId);
    if (activeCase) {
      const currentStep =
        activeCase.steps.find((s) => s.stepNumber === stepNumber) || activeCase.steps[0];

      // Cek apakah siswa meminta ganti kasus:
      if (isAskingForAnotherCase(userMessage, recentHistory)) {
        const currIndex = LEARNING_CASES.findIndex((c) => c.id === activeCase.id);
        const nextCase = LEARNING_CASES[(currIndex + 1) % LEARNING_CASES.length];
        return NextResponse.json({
          reply: `Baik, mari kita beralih ke investigasi kasus berikutnya: ${nextCase.title}.\n\n${nextCase.steps[0].chatbotQuestion}`,
          character: nextCase.character,
          caseId: nextCase.id,
          stepNumber: 1,
          totalSteps: nextCase.steps.length,
          stepTitle: nextCase.steps[0].title,
          roleName: nextCase.roleName,
          isCompleted: false,
        });
      }

      // Evaluasi jawaban siswa terhadap langkah saat ini:
      const isCorrect = evaluateAnswerAgainstStep(userMessage, currentStep);

      if (isCorrect) {
        if (currentStep.stepNumber < activeCase.steps.length) {
          const nextStep = activeCase.steps[currentStep.stepNumber]; // index is stepNumber
          const combinedReply = `${currentStep.reinforcementIfCorrect}\n\n${nextStep.chatbotQuestion}`;
          return NextResponse.json({
            reply: combinedReply,
            character: activeCase.character,
            caseId: activeCase.id,
            stepNumber: nextStep.stepNumber,
            totalSteps: activeCase.steps.length,
            stepTitle: nextStep.title,
            roleName: activeCase.roleName,
            isCompleted: false,
          });
        } else {
          // Tahap 4 Selesai (Tuntas):
          const completionReply = `${currentStep.reinforcementIfCorrect}\n\n${currentStep.closingText || ""}\n\nSelamat! Kamu telah menyelesaikan penyelidikan kasus ini. Apakah kamu ingin mencoba kasus investigasi lainnya?`;
          return NextResponse.json({
            reply: completionReply,
            character: activeCase.character,
            caseId: activeCase.id,
            stepNumber: 4,
            totalSteps: activeCase.steps.length,
            stepTitle: currentStep.title,
            roleName: activeCase.roleName,
            isCompleted: true,
          });
        }
      } else {
        // Jawaban siswa belum tepat -> berikan petunjuk terarah dari update.md:
        return NextResponse.json({
          reply: currentStep.hintIfWrong,
          character: activeCase.character,
          caseId: activeCase.id,
          stepNumber: currentStep.stepNumber,
          totalSteps: activeCase.steps.length,
          stepTitle: currentStep.title,
          roleName: activeCase.roleName,
          isCompleted: false,
        });
      }
    }

    // Format pesan sesuai standar OpenAI chat completion
    const systemInstruction = getSystemInstruction(phase);
    const messages = [
      { role: "system" as const, content: systemInstruction },
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

          const fullPrompt = `${systemInstruction}\n\n${historyText ? historyText + "\n\n" : ""}Anak bertanya/merespons: ${userMessage.trim()}\n\nJawab sebagai karakter yang tepat dalam format JSON:`;

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
      if (isAskingForAnotherCase(userMessage, recentHistory)) {
        // Jika minta kasus lain tapi menyebut organ spesifik (misal: "coba studi kasus batang otak")
        if (isExplicitTopicSwitch(userMessage)) {
          const specificCase = getCaseStudyFallback(userMessage);
          if (specificCase) {
            reply = specificCase.reply;
            character = specificCase.character;
          } else {
            const activeChar = currentCharacter && currentCharacter !== "neuron" ? currentCharacter : "otakbesar";
            reply = getCaseStudyForCharacter(activeChar, recentHistory);
            character = activeChar;
          }
        } else {
          // Karakter TETAP SAMA karena hanya minta studi kasus lain seputar topik saat ini
          const activeChar = currentCharacter && currentCharacter !== "neuron" ? currentCharacter : "otakbesar";
          reply = getCaseStudyForCharacter(activeChar, recentHistory);
          character = activeChar;
        }
      } else if (isExplicitTopicSwitch(userMessage)) {
        // Siswa secara eksplisit meminta ganti topik ke organ lain
        const topicFallback = getCaseStudyFallback(userMessage);
        if (topicFallback) {
          reply = topicFallback.reply;
          character = topicFallback.character;
        } else {
          const evalFallback = evaluateCaseStudyFallback(userMessage, currentCharacter);
          reply = evalFallback.reply;
          character = evalFallback.character;
        }
      } else {
        // Siswa sedang menjawab/menanggapi studi kasus yang sedang berjalan (meski menyebut nama organ)
        const evalFallback = evaluateCaseStudyFallback(userMessage, currentCharacter);
        reply = evalFallback.reply;
        character = evalFallback.character;
      }
    }

    return NextResponse.json({ reply, character });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
    console.error("Error generating response:", errorMessage);

    if (isAskingForAnotherCase(userMessage, [])) {
      if (isExplicitTopicSwitch(userMessage)) {
        const specificCase = getCaseStudyFallback(userMessage);
        if (specificCase) {
          return NextResponse.json({ reply: specificCase.reply, character: specificCase.character }, { status: 200 });
        }
      }
      const activeChar = currentCharacter && currentCharacter !== "neuron" ? currentCharacter : "otakbesar";
      return NextResponse.json({
        reply: getCaseStudyForCharacter(activeChar, []),
        character: activeChar,
      }, { status: 200 });
    }

    if (isExplicitTopicSwitch(userMessage)) {
      const topicFallback = getCaseStudyFallback(userMessage);
      if (topicFallback) {
        return NextResponse.json({ reply: topicFallback.reply, character: topicFallback.character }, { status: 200 });
      }
    }

    const evalFallback = evaluateCaseStudyFallback(userMessage, currentCharacter);
    return NextResponse.json({ reply: evalFallback.reply, character: evalFallback.character }, { status: 200 });
  }
}

function isExplicitTopicSwitch(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Jika tombol topik diklik
  if (lower.startsWith("saya ingin membahas topik:") || lower.includes("pilih topik:")) {
    return true;
  }

  // Frasa eksplisit meminta ganti topik
  const switchKeywords = [
    "ganti topik ke",
    "ganti topik",
    "pindah topik",
    "pindah ke",
    "mau bahas",
    "ingin bahas",
    "coba topik",
    "bahas topik",
    "topik berikutnya",
    "topik selanjutnya",
    "ganti ke organ",
  ];

  return switchKeywords.some((kw) => lower.includes(kw));
}

const TOPIC_CYCLE = ["otakbesar", "batangotak", "sumsum", "badansel", "otakkecil", "sarafkranial"];

function wasLastPromptAskingForNextCase(history: MessageHistoryItem[]): boolean {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "model") {
      const content = history[i].content.toLowerCase();
      return (
        content.includes("studi kasus lain") ||
        content.includes("study kasus lain") ||
        content.includes("kasus lain") ||
        content.includes("topik ini?")
      );
    }
  }
  return false;
}

function isAskingForAnotherCase(query: string, history: MessageHistoryItem[] = []): boolean {
  const lower = query.toLowerCase().trim();

  // 1. Perintah navigasi langsung (misal: "next", "skip", "lewat", "lewati", "lanjut")
  const directCommands = ["next", "skip", "lewat", "lewati", "lanjut", "pindah", "ganti"];
  if (directCommands.some((cmd) => lower === cmd || lower.startsWith(cmd + " ") || lower.endsWith(" " + cmd))) {
    return true;
  }

  // 2. Kombinasi kata aksi + target (misal: "ganti study kasus brayyyyy", "mau kasus lain", "minta topik baru", dll)
  const actionWords = ["ganti", "pindah", "ubah", "tukar", "minta", "coba", "kasih", "berikan", "mau", "pengen", "next", "skip"];
  const targetWords = ["kasus", "topik", "study", "studi", "soal", "materi", "organ", "bagian", "pembahasan"];

  const hasAction = actionWords.some((w) => lower.includes(w));
  const hasTarget = targetWords.some((w) => lower.includes(w));

  if (hasAction && hasTarget) return true;

  // 3. Pola target + diferensiasi (misal: "kasus lain lur", "topik baru bro", "kasus berikutnya", dll)
  const diffWords = ["lain", "baru", "berikutnya", "selanjutnya", "beda", "yg lain", "yang lain"];
  const hasDiff = diffWords.some((w) => lower.includes(w));

  if (hasTarget && hasDiff) return true;

  // 4. Jika pesan terakhir chatbot menawarkan studi kasus lain ("Apakah kamu ingin mencoba studi kasus lain?")
  if (wasLastPromptAskingForNextCase(history)) {
    const isQuestion =
      lower.includes("kenapa") ||
      lower.includes("mengapa") ||
      lower.includes("bagaimana") ||
      lower.includes("apa itu") ||
      lower.includes("maksudnya");

    // Jika bukan pertanyaan tanya konsep (misal hanya: "ya", "mau dong", "gas", "ayok", "coba bray", "oke min", dll)
    if (!isQuestion) {
      return true;
    }
  }

  return false;
}

const CASE_STUDIES_BY_CHAR: Record<string, string[]> = {
  otakbesar: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang pasien tiba-tiba mengalami kesulitan berbicara dan menggerakkan lengan kanannya setelah terjatuh. Menurut analisismu, mengapa gangguan pada otak besar dapat memicu kondisi tersebut?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang pasien mengalami kesulitan mengenali wajah orang terdekatnya dan memproses informasi visual setelah benturan kepala bagian belakang. Menurut analisismu, bagian lobus mana pada otak besar yang mengalami gangguan fungsi?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seseorang mengalami kesulitan mengingat kejadian baru yang baru saja terjadi beberapa jam lalu. Menurut analisismu, mengapa bagian otak besar berperan penting dalam pembentukan memori?",
  ],
  batangotak: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang pasien di rumah sakit mengalami gangguan pada ritme pernapasan spontan dan denyut jantung yang melemah. Menurut analisismu, fungsi vital apa dari batang otak yang terganggu?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang pasien tersedak terus-menerus karena refleks menelan dan batuknya melemah drastis setelah mengalami benturan di leher atas. Menurut analisismu, mengapa refleks vital ini dikontrol oleh batang otak?",
  ],
  sumsum: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Ketika jari tidak sengaja menyentuh wajan panas, tangan seketika menarik diri sebelum kita sempat merasakan sakitnya secara sadar. Menurutmu, bagaimana peran sumsum tulang belakang dalam gerak refleks tersebut?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang atlet mengalami cedera punggung bawah dan kehilangan sensasi sentuhan di kedua kakinya, namun fungsi organ di dada tetap normal. Menurut analisismu, mengapa cedera pada segmen sumsum tulang belakang menghambat transmisi sensasi tersebut?",
  ],
  badansel: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Sebuah toksin merusak bagian inti dan metabolisme neuron sehingga sel saraf tidak mampu memproses pesan rangsangan. Menurut analisismu, bagian mana dari sel saraf yang mengalami gangguan?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Suatu zat menghambat sintesis protein di dalam pusat sel neuron sehingga sel saraf perlahan mengalami degenerasi. Menurut analisismu, bagaimana peran badan sel dalam kelangsungan hidup neuron?",
  ],
  otakkecil: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seseorang mengalami kesulitan menjaga keseimbangan saat berjalan dan tangannya gemetar saat hendak meraih cangkir. Menurut analisismu, bagaimana peran otak kecil dalam mengontrol koordinasi gerak halus tersebut?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang penari profesional tiba-tiba kehilangan kelenturan dan ritme gerak tubuh yang telah dilatih bertahun-tahun setelah mengalami cedera di kepala belakang bawah. Menurut analisismu, mengapa otak kecil sangat penting dalam koordinasi gerakan terlatih?",
  ],
  sarafkranial: [
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seorang pasien tidak dapat menggerakkan separuh otot wajahnya dan kehilangan kepekaan rasa pada lidah. Menurut analisismu, saraf kranial manakah yang mengalami gangguan?",
    "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Seseorang tiba-tiba kehilangan kemampuan mencium aroma makanan setelah mengalami infeksi saluran pernapasan atas. Menurut analisismu, saraf kranial nomor berapa yang menghantarkan sensasi penciuman ini ke otak?",
  ],
};

function getCaseStudyForCharacter(char: string, history: MessageHistoryItem[] = []): string {
  const cases = CASE_STUDIES_BY_CHAR[char] || CASE_STUDIES_BY_CHAR["otakbesar"];
  const historyText = history.map((h) => h.content).join(" ");

  for (const c of cases) {
    const snippet = c.slice(75, 115);
    if (!historyText.includes(snippet)) {
      return c;
    }
  }
  return cases[1] || cases[0];
}

function getCaseStudyByCharacter(char: string): { reply: string; character: string } {
  const cases = CASE_STUDIES_BY_CHAR[char] || CASE_STUDIES_BY_CHAR["otakbesar"];
  return {
    character: char,
    reply: cases[0],
  };
}

function getCaseStudyFallback(query: string): { reply: string; character: string } | null {
  const lower = query.toLowerCase();

  // Otak Besar
  if (lower.includes("otak besar") || lower.includes("otakbesar") || lower.includes("cerebrum")) {
    return getCaseStudyByCharacter("otakbesar");
  }
  // Otak Kecil
  if (lower.includes("otak kecil") || lower.includes("otakkecil") || lower.includes("cerebellum")) {
    return getCaseStudyByCharacter("otakkecil");
  }
  // Batang Otak
  if (lower.includes("batang otak") || lower.includes("batangotak")) {
    return getCaseStudyByCharacter("batangotak");
  }
  // Saraf Kranial
  if (lower.includes("kranial")) {
    return getCaseStudyByCharacter("sarafkranial");
  }
  // Sumsum Tulang Belakang & Saraf Spinal
  if (lower.includes("tulang belakang") || lower.includes("sumsum") || lower.includes("spinal")) {
    return getCaseStudyByCharacter("sumsum");
  }
  // Dendrit
  if (lower.includes("dendrit")) {
    return {
      character: "dendrit",
      reply: "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Impuls rangsangan dari luar tidak dapat diterima oleh badan sel saraf. Menurut analisismu, bagaimana kerusakan pada percabangan dendrit dapat menghambat penerimaan sinyal saraf?",
    };
  }
  // Neurit / Akson
  if (lower.includes("neurit") || lower.includes("akson") || lower.includes("mielin")) {
    return {
      character: "neurit",
      reply: "Untuk mempelajari topik ini, kita akan menggunakan studi kasus berikut: Selubung mielin pelindung kabel saraf menipis sehingga transmisi sinyal listrik melambat drastis. Menurut analisismu, bagaimana peran neurit dalam menghantarkan impuls ke organ efektor?",
    };
  }
  // Badan Sel / Struktur Saraf
  if (lower.includes("sel") || lower.includes("struktur") || lower.includes("badansel") || lower.includes("saraf")) {
    return getCaseStudyByCharacter("badansel");
  }

  return null;
}

function evaluateCaseStudyFallback(query: string, currentCharacter: string): { reply: string; character: string } {
  const lower = query.toLowerCase();
  const char = currentCharacter && currentCharacter !== "neuron" ? currentCharacter : "badansel";

  if (char === "badansel") {
    const isCorrect = lower.includes("badan sel") || lower.includes("soma") || lower.includes("inti");
    if (isCorrect) {
      return {
        character: "badansel",
        reply: "Analisis yang sangat tepat! Bagian sel saraf yang memiliki inti dan mengatur seluruh metabolisme sel adalah badan sel (soma). Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    } else {
      return {
        character: "badansel",
        reply: "Tanggapanmu kurang tepat. Bagian sel saraf yang memiliki inti sel dan mengontrol metabolisme adalah badan sel (soma), bukan kepala. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    }
  }

  if (char === "otakbesar") {
    const isCorrect = lower.includes("motorik") || lower.includes("bicara") || lower.includes("bahasa") || lower.includes("frontal") || lower.includes("broca") || lower.includes("gerak");
    if (isCorrect) {
      return {
        character: "otakbesar",
        reply: "Analisis yang sangat tepat! Otak besar (cerebrum) memiliki korteks motorik untuk gerak sadar dan area Broca untuk fungsi bicara. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    } else {
      return {
        character: "otakbesar",
        reply: "Tanggapanmu kurang tepat. Sebenarnya, gejala tersebut terjadi karena cedera pada korteks motorik dan pusat bicara di otak besar (cerebrum). Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    }
  }

  if (char === "batangotak") {
    const isCorrect = lower.includes("napas") || lower.includes("pernapasan") || lower.includes("jantung") || lower.includes("vital") || lower.includes("otonom");
    if (isCorrect) {
      return {
        character: "batangotak",
        reply: "Analisis yang sangat tepat! Batang otak merupakan pusat pengendali fungsi vital otonom yang bekerja otomatis tanpa kita sadari. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    } else {
      return {
        character: "batangotak",
        reply: "Tanggapanmu kurang tepat. Batang otak bertanggung jawab langsung atas kendali fungsi vital seperti denyut jantung dan ritme pernapasan. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    }
  }

  if (char === "sumsum") {
    const isCorrect = lower.includes("refleks") || lower.includes("cepat") || lower.includes("tulang belakang") || lower.includes("impuls");
    if (isCorrect) {
      return {
        character: "sumsum",
        reply: "Analisis yang sangat tepat! Sumsum tulang belakang memproses gerak refleks secara langsung melalui lengkung refleks tanpa harus menunggu sinyal dari otak. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    } else {
      return {
        character: "sumsum",
        reply: "Tanggapanmu kurang tepat. Gerakan menarik diri secara cepat adalah mekanisme gerak refleks yang diproses langsung oleh sumsum tulang belakang. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    }
  }

  if (char === "otakkecil") {
    const isCorrect = lower.includes("keseimbangan") || lower.includes("koordinasi") || lower.includes("gerak");
    if (isCorrect) {
      return {
        character: "otakkecil",
        reply: "Analisis yang sangat tepat! Otak kecil (cerebellum) berfungsi mengatur koordinasi gerak halus dan menjaga keseimbangan tubuh. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    } else {
      return {
        character: "otakkecil",
        reply: "Tanggapanmu kurang tepat. Otak kecil (cerebellum) adalah organ yang bertugas menyelaraskan koordinasi gerak otot halus dan keseimbangan tubuh. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
      };
    }
  }

  return {
    character: char,
    reply: "Tanggapanmu sudah dipahami. Sistem saraf saling terhubung secara kompleks untuk mengoordinasikan seluruh respon tubuh. Apakah kamu ingin mencoba studi kasus lain, atau ada pertanyaan seputar topik ini?",
  };
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

function evaluateAnswerAgainstStep(answer: string, step: DialogStep): boolean {
  const lower = answer.toLowerCase().trim();

  // Jika jawaban terlalu pendek atau menyatakan tidak tahu
  if (lower.length < 2) return false;
  if (
    lower.includes("tidak tahu") ||
    lower.includes("gatau") ||
    lower.includes("nggak tau") ||
    lower.includes("kurang tahu") ||
    lower.includes("belum tahu") ||
    lower.includes("ngga tau") ||
    lower === "entah" ||
    lower === "skip"
  ) {
    return false;
  }

  // Cek kata kunci yang cocok dari daftar keywords
  const matched = step.keywords.filter((kw) => lower.includes(kw.toLowerCase()));

  // 1. Kasus 1 Step 1 (Definisi neuron & sel saraf)
  if (step.keywords.includes("neuron") && step.keywords.includes("sel saraf")) {
    const hasCell = lower.includes("sel") || lower.includes("neuron");
    const hasFunction =
      lower.includes("sinyal") ||
      lower.includes("informasi") ||
      lower.includes("impuls") ||
      lower.includes("hantar") ||
      lower.includes("kirim") ||
      lower.includes("terima") ||
      lower.includes("pesan") ||
      lower.includes("komunikasi");
    if (hasCell && hasFunction) return true;
    if (lower === "sel saraf" || lower === "neuron" || lower.includes("sel saraf atau neuron")) return true;
  }

  // 2. Kasus 1 Step 2 (3 bagian neuron: dendrit, badan sel, akson)
  if (step.keywords.includes("dendrit") && step.keywords.includes("badan sel")) {
    let partCount = 0;
    if (lower.includes("dendrit")) partCount++;
    if (lower.includes("badan sel") || lower.includes("soma")) partCount++;
    if (lower.includes("akson") || lower.includes("neurit")) partCount++;
    if (partCount >= 2) return true;
    if (partCount >= 1 && (lower.includes("sinyal") || lower.includes("terima") || lower.includes("potensial aksi"))) return true;
  }

  // 3. Kasus 1 Step 3 (Fungsi mielin: percepat impuls / saltatori)
  if (step.keywords.includes("saltatori") || (step.keywords.includes("mielin") && step.keywords.includes("cepat"))) {
    if (
      lower.includes("cepat") ||
      lower.includes("mempercepat") ||
      lower.includes("lambat") ||
      lower.includes("melambat") ||
      lower.includes("hambat") ||
      lower.includes("terganggu") ||
      lower.includes("saltatori")
    ) {
      return true;
    }
  }

  // 4. Kasus 2 Step 2 (Ion natrium & kalium)
  if (step.keywords.includes("natrium") && step.keywords.includes("kalium")) {
    if ((lower.includes("natrium") || lower.includes("na")) && (lower.includes("kalium") || lower.includes("k"))) {
      return true;
    }
    if (lower.includes("depolarisasi") || lower.includes("repolarisasi")) return true;
  }

  // 5. Kasus 3 Step 1 (Sinapsis)
  if (step.keywords.includes("sinapsis")) {
    if (lower.includes("sinaps") || lower.includes("sinapsis") || lower.includes("celah")) return true;
  }

  // 6. Kasus 4 Step 1 (Gerak sadar vs refleks)
  if (step.keywords.includes("refleks") && step.keywords.includes("sadar")) {
    if (
      (lower.includes("refleks") || lower.includes("otomatis")) &&
      (lower.includes("sadar") || lower.includes("sengaja") || lower.includes("beda") || lower.includes("tidak sama"))
    ) {
      return true;
    }
    if (lower.includes("refleks") || lower.includes("otomatis")) return true;
  }

  // Kecocokan minimal 2 kata kunci substansial
  if (matched.length >= 2) return true;

  // Jika ada 1 kata kunci penting dan penjelasan siswa cukup memadai (>= 3 kata)
  if (matched.length >= 1 && lower.split(/\s+/).length >= 3) return true;

  return false;
}

function getSystemInstruction(phase: string): string {
  return `Kamu adalah asisten edukasi anatomi sistem saraf interaktif berbasis AI.
Tugas utamamu adalah mendampingi siswa belajar anatomi melalui studi kasus klinis/keseharian, mengevaluasi jawaban mereka, dan memilih karakter visual 3D yang relevan.

DAFTAR KARAKTER DAN FOKUS ANATOMI:
- "otakbesar" (Otak Besar / Cerebrum - berpikir, memori, bahasa/bicara, motorik sadar)
- "otakkecil" (Otak Kecil / Cerebellum - keseimbangan tubuh, postur, koordinasi gerak halus)
- "batangotak" (Batang Otak - fungsi vital otonom: pernapasan, denyut jantung, refleks batuk/menelan)
- "sarafkranial" (Saraf Kranial - 12 pasang saraf kepala: penglihatan, pendengaran, penciuman, ekspresi wajah)
- "sumsum" (Sumsum Tulang Belakang - penghantar impuls utama dan pusat gerak refleks cepat)
- "sarafspinal" (Saraf Spinal - 31 pasang saraf tepi tulang belakang ke anggota tubuh)
- "badansel" (Badan Sel Saraf - pusat metabolisme neuron dan pemrosesan informasi sel)
- "dendrit" (Dendrit - percabangan penerima impuls/sinyal dari sel saraf lain)
- "neurit" (Neurit / Akson - serabut panjang penghantar impuls listrik dengan selubung mielin)
- "ganglia" (Ganglia - kelompok badan sel saraf di luar sistem saraf pusat)
- "neuron" (Neuron - pengantar umum dan pemandu)

ATURAN FORMAT WAJIB:
1. Jawab dengan profesional, ramah, ringkas (maksimal 2-3 kalimat).
2. Gaya bahasa baku, komunikatif, mendidik. JANGAN gunakan emoji.
3. JANGAN gunakan format markdown seperti ** * # -.
4. Jawab HANYA dalam format JSON valid:
   {
     "character": "id_karakter",
     "reply": "jawaban teks di sini"
   }
5. id_karakter HANYA boleh salah satu dari daftar di atas.`;
}
