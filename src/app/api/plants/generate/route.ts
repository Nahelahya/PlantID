import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "gemma2-9b-it";

interface GeneratedPlant {
  name: string;
  scientificName: string;
  genus: string;
  family: string;
  kingdom: string;
  description: string;
  careGuide: {
    watering: string;
    sunlight: string;
    temperature: string;
    soil: string;
    fertilizer: string;
    humidity: string;
    toxicity: string;
    pruning: string;
    repotting: string;
    difficulty: string;
  };
  distributions: Array<{
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    type: string;
  }>;
  diseases: Array<{
    name: string;
    scientificName?: string;
    symptoms: string;
    cause?: string;
    treatment: string;
    prevention?: string;
  }>;
}

async function generatePlantWithGroq(plantName: string): Promise<GeneratedPlant | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not configured, using mock data");
    return generateMockPlant(plantName);
  }

  const prompt = `Generate comprehensive plant information for "${plantName}" in JSON format. 
  
  Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
  {
    "name": "local/common name in Indonesian",
    "scientificName": "scientific name (Genus species)",
    "genus": "genus name",
    "family": "plant family",
    "kingdom": "Plantae",
    "description": "2-3 sentences description of the plant",
    "careGuide": {
      "watering": "watering frequency and amount",
      "sunlight": "light requirements",
      "temperature": "temperature range in celsius",
      "soil": "soil type and requirements",
      "fertilizer": "fertilizer recommendations",
      "humidity": "humidity level percentage",
      "toxicity": "toxicity to pets or humans",
      "pruning": "pruning instructions",
      "repotting": "repotting frequency",
      "difficulty": "Easy/Medium/Hard"
    },
    "distributions": [
      {
        "region": "region name",
        "country": "country name",
        "latitude": 0.0,
        "longitude": 0.0,
        "type": "native or introduced"
      }
    ],
    "diseases": [
      {
        "name": "disease name",
        "scientificName": "disease scientific name",
        "symptoms": "symptoms description",
        "cause": "cause of disease",
        "treatment": "treatment method",
        "prevention": "prevention method"
      }
    ]
  }

  Important: 
  - Provide at least 2-3 distributions
  - Provide at least 1-2 diseases
  - All coordinates must be realistic
  - All text must be in Indonesian`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Groq API error: ${response.status} - ${error}`);
    console.warn("Falling back to mock data generator");
    return generateMockPlant(plantName);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.warn("No response from Groq, using mock data");
    return generateMockPlant(plantName);
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("Could not extract JSON from Groq response, using mock data");
    return generateMockPlant(plantName);
  }

  const plantData = JSON.parse(jsonMatch[0]) as GeneratedPlant;
  return plantData;
}

function generateMockPlant(plantName: string): GeneratedPlant {
  const mockData: { [key: string]: GeneratedPlant } = {
    stroberi: {
      name: "Stroberi",
      scientificName: "Fragaria × ananassa",
      genus: "Fragaria",
      family: "Rosaceae",
      kingdom: "Plantae",
      description:
        "Stroberi adalah tanaman buah yang populer dengan rasa manis dan asam. Tanaman ini tumbuh rendah dengan buah merah cerah yang kaya vitamin C.",
      careGuide: {
        watering: "Siram 2-3 kali seminggu, biarkan tanah lembab.",
        sunlight: "Sinar matahari penuh 6-8 jam.",
        temperature: "15-25°C.",
        soil: "Tanah gembur, subur, dengan drainase baik.",
        fertilizer: "Pupuk NPK setiap 2-3 minggu.",
        humidity: "Kelembaban sedang 50-70%.",
        toxicity: "Tidak beracun.",
        pruning: "Potong daun mati dan runner.",
        repotting: "Tanaman musiman, ganti setiap musim.",
        difficulty: "Mudah",
      },
      distributions: [
        { region: "California", country: "Amerika Serikat", latitude: 36.5, longitude: -119.5, type: "native" },
        { region: "Jawa Barat", country: "Indonesia", latitude: -7.0, longitude: 107.0, type: "introduced" },
        { region: "Spanyol", country: "Spanyol", latitude: 40.0, longitude: -3.5, type: "introduced" },
      ],
      diseases: [
        {
          name: "Busuk Buah",
          scientificName: "Botrytis cinerea",
          symptoms: "Buah berwarna abu-abu, lembek.",
          cause: "Kelembaban tinggi.",
          treatment: "Potong bagian busuk, fungisida.",
          prevention: "Jaga sirkulasi udara.",
        },
        {
          name: "Bercak Daun",
          scientificName: "Mycosphaerella fragariae",
          symptoms: "Bercak merah-ungu pada daun.",
          cause: "Infeksi jamur.",
          treatment: "Fungisida preventif.",
          prevention: "Rotasi tanam.",
        },
      ],
    },
    cengkeh: {
      name: "Cengkeh",
      scientificName: "Syzygium aromaticum",
      genus: "Syzygium",
      family: "Myrtaceae",
      kingdom: "Plantae",
      description:
        "Cengkeh adalah tanaman rempah asli Indonesia yang menghasilkan bunga kering berkualitas tinggi. Aroma kuat dan rasa pedas menjadikannya bahan penting dalam masakan dan obatan tradisional.",
      careGuide: {
        watering: "Siram 2-3 kali seminggu.",
        sunlight: "Sinar matahari penuh 8 jam.",
        temperature: "25-30°C.",
        soil: "Tanah vulkanik subur.",
        fertilizer: "Pupuk NPK setiap 3 bulan.",
        humidity: "Tinggi 70-80%.",
        toxicity: "Aman.",
        pruning: "Pangkas cabang tidak produktif.",
        repotting: "Setiap 2-3 tahun.",
        difficulty: "Sedang",
      },
      distributions: [
        { region: "Maluku", country: "Indonesia", latitude: -2.5, longitude: 129.0, type: "native" },
        { region: "Madagascar", country: "Madagascar", latitude: -20.0, longitude: 47.0, type: "introduced" },
        { region: "Zanzibar", country: "Tanzania", latitude: -6.16, longitude: 39.2, type: "introduced" },
      ],
      diseases: [
        {
          name: "Penyakit Layu",
          scientificName: "Fusarium oxysporum",
          symptoms: "Daun menguning, layu.",
          cause: "Jamur tanah.",
          treatment: "Varietas tahan.",
          prevention: "Bibit sehat.",
        },
      ],
    },
    tomat: {
      name: "Tomat",
      scientificName: "Solanum lycopersicum",
      genus: "Solanum",
      family: "Solanaceae",
      kingdom: "Plantae",
      description:
        "Tomat adalah tanaman sayuran buah yang sangat populer di seluruh dunia. Kaya akan licopin dan vitamin C, tomat banyak digunakan dalam masakan sehari-hari.",
      careGuide: {
        watering: "Siram 2-3 kali seminggu, hindari daun basah.",
        sunlight: "Sinar matahari penuh 8 jam.",
        temperature: "21-29°C.",
        soil: "Tanah gembur, subur, berdrainage baik.",
        fertilizer: "Pupuk NPK setiap 2 minggu.",
        humidity: "Sedang 50-65%.",
        toxicity: "Buah matang aman.",
        pruning: "Potong tunas samping.",
        repotting: "Tanaman semusim, 60-80 hari panen.",
        difficulty: "Mudah",
      },
      distributions: [
        { region: "Peru", country: "Peru", latitude: -9.19, longitude: -77.88, type: "native" },
        { region: "Jawa Timur", country: "Indonesia", latitude: -7.25, longitude: 112.75, type: "introduced" },
        { region: "Italia", country: "Italia", latitude: 41.87, longitude: 12.56, type: "introduced" },
      ],
      diseases: [
        {
          name: "Bercak Daun",
          scientificName: "Alternaria solani",
          symptoms: "Bercak coklat berbentuk target.",
          cause: "Infeksi jamur.",
          treatment: "Fungisida tembaga.",
          prevention: "Jarak tanam lebar.",
        },
        {
          name: "Layu Bakteri",
          scientificName: "Ralstonia solanacearum",
          symptoms: "Layu mendadak.",
          cause: "Bakteri tanah.",
          treatment: "Musnahkan tanaman.",
          prevention: "Rotasi tanam.",
        },
      ],
    },
  };

  const normalizedName = plantName.toLowerCase().trim();
  return mockData[normalizedName] || createDefaultMockPlant(plantName);
}

function createDefaultMockPlant(plantName: string): GeneratedPlant {
  return {
    name: plantName,
    scientificName: `${plantName} sp.`,
    genus: plantName.charAt(0).toUpperCase() + plantName.slice(1),
    family: "Plantaceae",
    kingdom: "Plantae",
    description: `${plantName} adalah tanaman yang menarik dengan berbagai manfaat. Tanaman ini memerlukan perawatan khusus untuk pertumbuhan optimal.`,
    careGuide: {
      watering: "Siram 2-3 kali seminggu.",
      sunlight: "Cahaya terang tidak langsung.",
      temperature: "18-28°C.",
      soil: "Tanah gembur dan subur.",
      fertilizer: "Pupuk cair seimbang setiap 2-4 minggu.",
      humidity: "Kelembaban sedang 50-70%.",
      toxicity: "Periksa tingkat toksisitas sebelum perawatan.",
      pruning: "Pangkas daun mati dan rusak.",
      repotting: "Setiap 1-2 tahun.",
      difficulty: "Mudah",
    },
    distributions: [
      { region: "Tropis", country: "Indonesia", latitude: -0.5, longitude: 113.75, type: "native" },
      { region: "Sedang", country: "China", latitude: 35.86, longitude: 104.2, type: "introduced" },
    ],
    diseases: [
      {
        name: "Busuk Akar",
        scientificName: "Pythium spp.",
        symptoms: "Daun menguning, layu.",
        cause: "Overwatering.",
        treatment: "Kurangi penyiraman.",
        prevention: "Drainase baik.",
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantName } = body;

    if (!plantName || typeof plantName !== "string") {
      return NextResponse.json(
        { error: "Plant name is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if plant already exists
    const existingPlant = await prisma.plant.findFirst({
      where: {
        OR: [
          { name: { contains: plantName } },
          { scientificName: { contains: plantName } },
        ],
      },
      include: {
        careGuide: true,
        distributions: true,
        diseases: true,
      },
    });

    if (existingPlant) {
      return NextResponse.json(
        {
          message: "Plant already exists in database",
          plant: existingPlant,
        },
        { status: 200 }
      );
    }

    // Generate plant data using Groq
    console.log(`Generating plant data for: ${plantName}`);
    const plantData = await generatePlantWithGroq(plantName);

    if (!plantData) {
      return NextResponse.json(
        { error: "Failed to generate plant data from Groq" },
        { status: 500 }
      );
    }

    // Save to database
    const { careGuide, distributions, diseases, ...plantInfo } = plantData;

    const createdPlant = await prisma.plant.create({
      data: {
        ...plantInfo,
        imageUrl: null, // Can be added later
        careGuide: {
          create: careGuide,
        },
        distributions: {
          create: distributions,
        },
        diseases: {
          create: diseases,
        },
      },
      include: {
        careGuide: true,
        distributions: true,
        diseases: true,
      },
    });

    console.log(`Successfully created plant: ${createdPlant.name}`);

    return NextResponse.json(
      {
        message: "Plant generated and saved successfully",
        plant: createdPlant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Plant generation error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to generate plant",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate plant" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST method to generate plants",
      example: {
        method: "POST",
        body: { plantName: "Tomato" },
      },
    },
    { status: 405 }
  );
}
