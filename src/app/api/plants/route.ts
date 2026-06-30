import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q");

  try {
    if (id) {
      const plant = await prisma.plant.findUnique({
        where: { id: parseInt(id) },
        include: { careGuide: true, distributions: true, diseases: true },
      });
      if (!plant) {
        return NextResponse.json({ error: "Plant not found" }, { status: 404 });
      }
      return NextResponse.json({ plant });
    }

    if (q) {
      const plants = await prisma.plant.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { scientificName: { contains: q } },
            { genus: { contains: q } },
          ],
        },
        include: { careGuide: true, distributions: true, diseases: true },
        take: 20,
      });
      return NextResponse.json({ plants });
    }

    const plants = await prisma.plant.findMany({
      include: { careGuide: true, distributions: true, diseases: true },
    });
    return NextResponse.json({ plants });
  } catch (error) {
    console.error("Plants API error:", error);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}
