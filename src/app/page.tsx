"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleIdentify = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Gagal mengidentifikasi tanaman");
      }

      if (data.warning) {
        console.warn("Identifikasi:", data.warning);
      }

      const resultId = data.plant?.id || "unknown";
      const searchParams = new URLSearchParams();

      if (data.plantNetResult) {
        searchParams.set("name", data.plantNetResult.scientificName);
        searchParams.set("commonName", data.plantNetResult.commonNames[0] || "");
        searchParams.set("confidence", data.plantNetResult.confidence.toString());
        searchParams.set("genus", data.plantNetResult.genus);
        searchParams.set("family", data.plantNetResult.family);
      }

      searchParams.set("healthStatus", data.healthStatus.isHealthy ? "healthy" : "diseased");
      searchParams.set("healthConfidence", data.healthStatus.confidence.toString());
      if (data.healthStatus.diseaseName) {
        searchParams.set("diseaseName", data.healthStatus.diseaseName);
      }

      if (data.plant) {
        searchParams.set("plantId", data.plant.id.toString());
      }

      if (data.isSimulated) {
        searchParams.set("isSimulated", "1");
      }
      if (data.healthIsSimulated) {
        searchParams.set("healthIsSimulated", "1");
      }
      if (data.warning) {
        searchParams.set("warning", data.warning);
      }

      router.push(`/result/${resultId}?${searchParams.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold text-zinc-900">
          Identifikasi Tanaman
        </h1>
        <p className="text-lg text-zinc-500 max-w-lg mx-auto">
          Upload foto tanaman untuk mengidentifikasi jenis, genus, status kesehatan, dan mendapatkan panduan perawatan
        </p>
      </div>

      <ImageUpload onImageSelect={setImage} isLoading={isLoading} />

      {error && (
        <p className="text-center mt-4 text-red-500 text-sm">{error}</p>
      )}

      {image && !isLoading && (
        <div className="flex justify-center mt-6 animate-fade-in">
          <button
            onClick={handleIdentify}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-all shadow-lg hover:shadow-xl"
          >
            Identifikasi Tanaman
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center mt-8 gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Menganalisis tanaman...</p>
        </div>
      )}

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "🔍", title: "Identifikasi", desc: "Kenali jenis tanaman dari foto" },
          { icon: "❤️", title: "Deteksi Kesehatan", desc: "Cek apakah tanaman sehat atau sakit" },
          { icon: "🗺️", title: "Persebaran", desc: "Lihat wilayah asal & persebaran" },
          { icon: "📖", title: "Panduan Rawat", desc: "Dapatkan tips perawatan lengkap" },
        ].map((feature) => (
          <div key={feature.title} className="p-5 bg-white rounded-xl border border-zinc-100 text-center space-y-2 hover:shadow-md transition-shadow">
            <span className="text-3xl">{feature.icon}</span>
            <h3 className="font-semibold text-zinc-800">{feature.title}</h3>
            <p className="text-sm text-zinc-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
