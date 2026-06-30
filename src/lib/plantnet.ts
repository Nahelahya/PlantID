const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY || "";
const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all";

export interface PlantNetMatch {
  scientificName: string;
  commonNames: string[];
  genus: string;
  family: string;
  confidence: number;
  isSimulated: boolean;
  error?: string;
}

export async function identifyPlant(imageBase64: string): Promise<PlantNetMatch | null> {
  if (!PLANTNET_API_KEY) {
    console.warn("PlantNet API key tidak ditemukan. Set PLANTNET_API_KEY di .env");
    return {
      ...simulateIdentification(imageBase64),
      isSimulated: true,
      error: "API key PlantNet belum dikonfigurasi",
    };
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const mimeType = imageBase64.match(/^data:image\/(\w+);/)?.[1] || "jpeg";
    const blob = new Blob([byteArray], { type: `image/${mimeType}` });

    const formData = new FormData();
    formData.append("organs", "leaf");
    formData.append("images", blob, `plant.${mimeType}`);

    const response = await fetch(`${PLANTNET_API_URL}?api-key=${PLANTNET_API_KEY}&no-reject=true`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("PlantNet API error:", response.status, response.statusText, errBody);
      return {
        ...simulateIdentification(imageBase64),
        isSimulated: true,
        error: `PlantNet API gagal (${response.status}): ${errBody.substring(0, 200)}`,
      };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const best = data.results[0];
      return {
        scientificName: best.species.scientificNameWithoutAuthor,
        commonNames: best.species.commonNames || [],
        genus: best.species.genus?.scientificName || "",
        family: best.species.family?.scientificName || "",
        confidence: Math.round(best.score * 100),
        isSimulated: false,
      };
    }
    return null;
  } catch (error) {
    console.error("PlantNet API error:", error);
    return {
      ...simulateIdentification(imageBase64),
      isSimulated: true,
      error: error instanceof Error ? error.message : "Gagal terhubung ke PlantNet API",
    };
  }
}

function simulateIdentification(_imageBase64: string): PlantNetMatch {
  const plants = [
    { scientificName: "Monstera deliciosa", commonNames: ["Monstera", "Janda Bolong", "Swiss Cheese Plant"], genus: "Monstera", family: "Araceae" },
    { scientificName: "Sansevieria trifasciata", commonNames: ["Lidah Mertua", "Snake Plant"], genus: "Sansevieria", family: "Asparagaceae" },
    { scientificName: "Ficus elastica", commonNames: ["Karet Kebo", "Rubber Plant"], genus: "Ficus", family: "Moraceae" },
    { scientificName: "Aloe vera", commonNames: ["Lidah Buaya", "Aloe Vera"], genus: "Aloe", family: "Asphodelaceae" },
    { scientificName: "Rosa × hybrida", commonNames: ["Mawar", "Rose"], genus: "Rosa", family: "Rosaceae" },
    { scientificName: "Phalaenopsis amabilis", commonNames: ["Anggrek Bulan", "Moth Orchid"], genus: "Phalaenopsis", family: "Orchidaceae" },
    { scientificName: "Mangifera indica", commonNames: ["Mangga", "Mango"], genus: "Mangifera", family: "Anacardiaceae" },
    { scientificName: "Cocos nucifera", commonNames: ["Kelapa", "Coconut"], genus: "Cocos", family: "Arecaceae" },
    { scientificName: "Oryza sativa", commonNames: ["Padi", "Rice"], genus: "Oryza", family: "Poaceae" },
    { scientificName: "Hibiscus rosa-sinensis", commonNames: ["Kembang Sepatu", "Hibiscus"], genus: "Hibiscus", family: "Malvaceae" },
  ];

  const hash = _imageBase64.length;
  const index = hash % plants.length;
  const plant = plants[index];

  return {
    ...plant,
    confidence: 75 + (hash % 20),
    isSimulated: true,
    error: "Menggunakan data simulasi (PlantNet API tidak tersedia)",
  };
}
