export interface Plant {
  id: number;
  name: string;
  scientificName: string;
  genus: string;
  family: string;
  kingdom: string;
  description: string | null;
  imageUrl: string | null;
  careGuide: CareGuide | null;
  distributions: Distribution[];
  diseases: Disease[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CareGuide {
  id: number;
  plantId: number;
  watering: string;
  sunlight: string;
  temperature: string;
  soil: string;
  fertilizer: string;
  humidity: string | null;
  toxicity: string | null;
  pruning: string | null;
  repotting: string | null;
  difficulty: string | null;
}

export interface Distribution {
  id: number;
  plantId: number;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface Disease {
  id: number;
  plantId: number;
  name: string;
  scientificName: string | null;
  symptoms: string;
  cause: string | null;
  treatment: string;
  prevention: string | null;
}

export interface PlantNetResult {
  species: {
    scientificName: string;
    genus: string;
    family: string;
    commonNames: string[];
  };
  confidence: number;
}

export interface IdentifyResult {
  plant: Plant | null;
  plantNetResult: PlantNetResult | null;
  healthStatus: HealthStatus;
}

export interface HealthStatus {
  isHealthy: boolean;
  diseaseName: string | null;
  confidence: number;
}
