const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

function getApiKey(): string {
  return process.env.GROQ_API_KEY || "";
}

export interface DiseaseResult {
  isHealthy: boolean;
  diseaseName: string | null;
  confidence: number;
  isSimulated: boolean;
  error?: string;
}

export interface CombinedIdentification {
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  confidence: number;
}

export interface CombinedResult {
  identification: CombinedIdentification;
  health: {
    isHealthy: boolean;
    diseaseName: string | null;
    confidence: number;
  };
  isSimulated: boolean;
  error?: string;
}

async function groqFetch(imageBase64: string, prompt: string) {
  const GROQ_API_KEY = getApiKey();
  if (!GROQ_API_KEY) {
    return { ok: false, error: "API key Groq belum dikonfigurasi" };
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = imageBase64.match(/^data:image\/(\w+);/)?.[1] || "jpeg";

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    return { ok: false, error: `Groq API gagal (${response.status}): ${response.statusText}`, detail: errText };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return { ok: false, error: "Gagal membaca respons dari Groq API" };
  }

  try {
    return { ok: true, data: JSON.parse(jsonMatch[0]) };
  } catch {
    return { ok: false, error: "Gagal parse JSON dari respons Groq" };
  }
}

export async function detectDisease(imageBase64: string): Promise<DiseaseResult> {
  const prompt = "Analisis gambar tanaman ini. Apakah tanaman ini sehat atau memiliki penyakit? Berikan jawaban HANYA dalam format JSON tanpa teks lain: { \"isHealthy\": boolean, \"diseaseName\": string | null, \"confidence\": number }";

  const result = await groqFetch(imageBase64, prompt);
  if (!result.ok) {
    console.error("Groq disease error:", result.error);
    return {
      ...simulateDiseaseDetection(),
      isSimulated: true,
      error: result.error,
    };
  }

  return {
    isHealthy: result.data.isHealthy,
    diseaseName: result.data.diseaseName || null,
    confidence: typeof result.data.confidence === "number" ? result.data.confidence : 50,
    isSimulated: false,
  };
}

export async function identifyAndDetect(imageBase64: string): Promise<CombinedResult> {
  const prompt = "Analisis gambar tanaman ini. Identifikasi jenis tanaman dan deteksi kesehatannya. Berikan jawaban HANYA dalam format JSON tanpa teks lain: { \"scientificName\": string, \"commonNames\": string[], \"genus\": string, \"family\": string, \"identificationConfidence\": number, \"isHealthy\": boolean, \"diseaseName\": string | null, \"healthConfidence\": number }";

  const result = await groqFetch(imageBase64, prompt);
  if (!result.ok) {
    console.error("Groq combined error:", result.error);
    return {
      ...simulateCombined(),
      isSimulated: true,
      error: result.error,
    };
  }

  const d = result.data;
  return {
    identification: {
      scientificName: d.scientificName || "Tanaman tidak dikenal",
      commonNames: d.commonNames || [],
      genus: d.genus || "",
      family: d.family || "",
      confidence: typeof d.identificationConfidence === "number" ? d.identificationConfidence : 50,
    },
    health: {
      isHealthy: d.isHealthy,
      diseaseName: d.diseaseName || null,
      confidence: typeof d.healthConfidence === "number" ? d.healthConfidence : 50,
    },
    isSimulated: false,
  };
}

function simulateCombined(): CombinedResult {
  const plants = [
    { scientificName: "Monstera deliciosa", commonNames: ["Monstera", "Janda Bolong"], genus: "Monstera", family: "Araceae" },
    { scientificName: "Sansevieria trifasciata", commonNames: ["Lidah Mertua", "Snake Plant"], genus: "Sansevieria", family: "Asparagaceae" },
    { scientificName: "Ficus elastica", commonNames: ["Karet Kebo", "Rubber Plant"], genus: "Ficus", family: "Moraceae" },
    { scientificName: "Aloe vera", commonNames: ["Lidah Buaya", "Aloe Vera"], genus: "Aloe", family: "Asphodelaceae" },
    { scientificName: "Rosa × hybrida", commonNames: ["Mawar", "Rose"], genus: "Rosa", family: "Rosaceae" },
  ];
  const idx = Math.floor(Math.random() * plants.length);
  const plant = plants[idx];
  const healthy = Math.random() > 0.5;
  return {
    identification: {
      ...plant,
      confidence: 70 + Math.floor(Math.random() * 20),
    },
    health: {
      isHealthy: healthy,
      diseaseName: healthy ? null : "Busuk Daun",
      confidence: 70 + Math.floor(Math.random() * 20),
    },
    isSimulated: true,
    error: "Menggunakan data simulasi (Groq API tidak tersedia)",
  };
}

function simulateDiseaseDetection(): DiseaseResult {
  const rand = Math.random();
  if (rand > 0.6) {
    return { isHealthy: true, diseaseName: null, confidence: 85 + Math.floor(Math.random() * 10), isSimulated: true, error: "Menggunakan data simulasi (Groq API tidak tersedia)" };
  }
  const diseases = ["Busuk Akar", "Bercak Daun", "Jamur Tepung", "Layu Bakteri", "Antraknosa", "Kutu Daun", "Busuk Batang", "Karat Daun", "Virus Mosaik"];
  const diseaseIndex = Math.floor(Math.random() * diseases.length);
  return {
    isHealthy: false,
    diseaseName: diseases[diseaseIndex],
    confidence: 70 + Math.floor(Math.random() * 20),
    isSimulated: true,
    error: "Menggunakan data simulasi (Groq API tidak tersedia)",
  };
}
