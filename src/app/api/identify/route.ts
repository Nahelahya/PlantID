import { NextRequest, NextResponse } from "next/server";
import { identifyPlant } from "@/lib/plantnet";
import type { PlantNetMatch } from "@/lib/plantnet";
import { detectDisease, identifyAndDetect } from "@/lib/groq-disease";
import type { DiseaseResult } from "@/lib/groq-disease";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    let plantNetResult = await identifyPlant(image);
    let healthStatus: DiseaseResult | null = null;

    if (plantNetResult && !plantNetResult.isSimulated) {
      healthStatus = await detectDisease(image);
    } else {
      const combined = await identifyAndDetect(image);
      if (!combined.isSimulated) {
        plantNetResult = {
          scientificName: combined.identification.scientificName,
          commonNames: combined.identification.commonNames,
          genus: combined.identification.genus,
          family: combined.identification.family,
          confidence: combined.identification.confidence,
          isSimulated: false,
        };
        healthStatus = {
          isHealthy: combined.health.isHealthy,
          diseaseName: combined.health.diseaseName,
          confidence: combined.health.confidence,
          isSimulated: false,
        };
      } else {
        healthStatus = {
          isHealthy: true,
          diseaseName: null,
          confidence: 0,
          isSimulated: true,
          error: combined.error || "Gagal identifikasi",
        };
      }
    }

    let plant = null;
    if (plantNetResult) {
      const plantName = plantNetResult.commonNames?.[0] || plantNetResult.scientificName?.split(" ")[0] || "";
      plant = await prisma.plant.findFirst({
        where: {
          OR: [
            { scientificName: { contains: plantNetResult.scientificName } },
            { name: { contains: plantName } },
          ],
        },
        include: {
          careGuide: true,
          distributions: true,
          diseases: true,
        },
      });
    }

    const plantSimulated = plantNetResult?.isSimulated || false;
    const healthSimulated = healthStatus?.isSimulated || false;
    const isFullySimulated = plantSimulated && healthSimulated;

    return NextResponse.json({
      plant,
      plantNetResult,
      healthStatus,
      isSimulated: plantSimulated,
      healthIsSimulated: healthSimulated,
      isFullySimulated,
      warning: isFullySimulated
        ? "Identifikasi menggunakan data simulasi karena API tidak tersedia. Periksa konfigurasi API key di file .env"
        : plantSimulated
          ? "Identifikasi tanaman menggunakan data simulasi. Periksa API key PlantNet."
          : healthSimulated
            ? `Deteksi kesehatan menggunakan data simulasi. ${healthStatus?.error || "Periksa API key Groq."}`
            : null,
    });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json({
      error: "Gagal mengidentifikasi tanaman",
      detail: error instanceof Error ? error.message : "Terjadi kesalahan server",
    }, { status: 500 });
  }
}
