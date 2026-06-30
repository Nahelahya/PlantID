"use client";

import { useEffect, useState } from "react";
import type { Plant } from "@/types";
import { useRouter } from "next/navigation";

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateInput, setGenerateInput] = useState("");
  const [generateMessage, setGenerateMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const url = search ? `/api/plants?q=${encodeURIComponent(search)}` : "/api/plants";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setPlants(data.plants || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const handleGeneratePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateInput.trim()) return;

    setGenerating(true);
    setGenerateMessage("");

    try {
      const response = await fetch("/api/plants/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantName: generateInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGenerateMessage(`❌ Error: ${data.error || "Failed to generate plant"}`);
        return;
      }

      setGenerateMessage(`✅ ${data.message}`);
      setGenerateInput("");

      // Refresh plant list
      const refreshResponse = await fetch("/api/plants");
      const refreshData = await refreshResponse.json();
      setPlants(refreshData.plants || []);
    } catch (error) {
      setGenerateMessage(`❌ Error: ${error instanceof Error ? error.message : "Failed to generate"}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900">Database Tanaman</h1>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tanaman..."
          className="w-full px-4 py-2.5 pl-10 rounded-xl border border-zinc-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        />
        <svg className="absolute left-3 top-3 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Generate Plant Form */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
        <h2 className="font-bold text-lg text-green-900 mb-3">🤖 Generate Tanaman dengan AI Groq</h2>
        <form onSubmit={handleGeneratePlant} className="flex gap-2">
          <input
            type="text"
            value={generateInput}
            onChange={(e) => setGenerateInput(e.target.value)}
            placeholder="Masukkan nama tanaman (e.g., Tomat, Bunga Matahari)..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-green-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none"
            disabled={generating}
          />
          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </form>
        {generateMessage && (
          <p className={`mt-2 text-sm font-medium ${generateMessage.includes("✅") ? "text-green-700" : "text-red-700"}`}>
            {generateMessage}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => router.push(`/result/${plant.id}?plantId=${plant.id}&name=${encodeURIComponent(plant.scientificName)}&commonName=${encodeURIComponent(plant.name)}&genus=${plant.genus}&family=${plant.family}&healthStatus=healthy&healthConfidence=100`)}
              className="text-left p-6 bg-white rounded-xl border border-zinc-100 hover:border-green-300 hover:shadow-lg transition-all h-full flex flex-col gap-3"
            >
              {/* Header */}
              <div>
                <h2 className="font-bold text-lg text-zinc-900">{plant.name}</h2>
                <p className="text-sm text-zinc-600 italic">{plant.scientificName}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{plant.genus}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{plant.family}</span>
                </div>
              </div>

              {/* Care Guide */}
              {plant.careGuide && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-zinc-700 mb-2 flex items-center gap-1">
                    🌱 Cara Rawat
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-zinc-600">💧 Air: {plant.careGuide.watering}</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-zinc-600">☀️ Cahaya: {plant.careGuide.sunlight}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-zinc-600">🌡️ Suhu: {plant.careGuide.temperature}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded">
                      <p className="text-zinc-600">🪴 Tanah: {plant.careGuide.soil}</p>
                    </div>
                  </div>
                  {plant.careGuide.difficulty && (
                    <p className="text-xs text-zinc-600 mt-2">Tingkat Kesulitan: <span className="font-medium">{plant.careGuide.difficulty}</span></p>
                  )}
                </div>
              )}

              {/* Distribution */}
              {plant.distributions && plant.distributions.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-zinc-700 mb-2 flex items-center gap-1">
                    📍 Persebaran ({plant.distributions.length})
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {plant.distributions.slice(0, 3).map((dist, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {dist.country}
                      </span>
                    ))}
                    {plant.distributions.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        +{plant.distributions.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Diseases */}
              {plant.diseases && plant.diseases.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-zinc-700 mb-2 flex items-center gap-1">
                    ⚠️ Penyakit ({plant.diseases.length})
                  </h3>
                  <div className="space-y-1">
                    {plant.diseases.slice(0, 2).map((disease, idx) => (
                      <p key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                        {disease.name}
                      </p>
                    ))}
                    {plant.diseases.length > 2 && (
                      <p className="text-xs text-gray-600">+{plant.diseases.length - 2} penyakit lainnya</p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {plant.description && (
                <div className="border-t pt-3">
                  <p className="text-xs text-zinc-600 line-clamp-2">{plant.description}</p>
                </div>
              )}
            </button>
          ))}
          {plants.length === 0 && (
            <p className="col-span-full text-center text-zinc-400 py-8">
              Tidak ada tanaman ditemukan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
