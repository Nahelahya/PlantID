"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { Plant } from "@/types";
import HealthBadge from "@/components/HealthBadge";
import TaxonomyTree from "@/components/TaxonomyTree";
import CareGuide from "@/components/CareGuide";
import DistributionMap from "@/components/DistributionMap";

function ResultContent() {
  const searchParams = useSearchParams();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  const plantId = searchParams.get("plantId");
  const scientificName = searchParams.get("name") || "";
  const commonName = searchParams.get("commonName") || "";
  const confidence = parseInt(searchParams.get("confidence") || "0");
  const genus = searchParams.get("genus") || "";
  const family = searchParams.get("family") || "";
  const healthStatus = searchParams.get("healthStatus") || "healthy";
  const healthConfidence = parseInt(searchParams.get("healthConfidence") || "0");
  const diseaseName = searchParams.get("diseaseName");
  const isSimulated = searchParams.get("isSimulated") === "1";
  const healthIsSimulated = searchParams.get("healthIsSimulated") === "1";
  const warning = searchParams.get("warning");

  useEffect(() => {
    if (plantId && plantId !== "unknown") {
      fetch(`/api/plants?id=${plantId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.plant) setPlant(data.plant);
          else trySearchByName();
        })
        .catch(() => trySearchByName())
        .finally(() => setLoading(false));
    } else if (scientificName) {
      trySearchByName();
      setLoading(false);
    } else {
      setLoading(false);
    }

    function trySearchByName() {
      const q = scientificName.split(" ").slice(0, 2).join(" ");
      fetch(`/api/plants?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.plants?.[0]) setPlant(data.plants[0]);
        })
        .catch(console.error);
    }
  }, [plantId, scientificName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {warning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm animate-fade-in">
          <p className="font-semibold">⚠️ Mode Simulasi</p>
          <p className="mt-1">{warning}</p>
          <p className="mt-2 text-amber-600 text-xs">
            Daftar API key gratis di{" "}
            <a href="https://my.plantnet.org/" target="_blank" rel="noopener noreferrer" className="underline">my.plantnet.org</a>
            {" & "}
            <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a>
            , lalu isi di file <code>.env</code>
          </p>
        </div>
      )}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              {plant?.name || commonName || scientificName.split(" ")[0] || "Tanaman"}
            </h1>
            <p className="text-lg text-zinc-500 italic mt-1">
              {plant?.scientificName || scientificName}
            </p>
            {confidence > 0 && (
              <p className="text-sm text-zinc-400 mt-1">
                Confidence: {confidence}%
              </p>
            )}
          </div>
          <HealthBadge
            isHealthy={healthStatus === "healthy"}
            diseaseName={diseaseName || null}
            confidence={healthConfidence}
          />
        </div>
      </div>

      {plant?.description && (
        <div className="bg-white rounded-xl border border-zinc-100 p-5 animate-fade-in">
          <p className="text-zinc-600 leading-relaxed">{plant.description}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-4">
          <TaxonomyTree
            kingdom={plant?.kingdom || "Plantae"}
            family={plant?.family || family}
            genus={plant?.genus || genus}
            scientificName={plant?.scientificName || scientificName}
          />
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="font-semibold text-zinc-700 text-sm mb-3">Status Kesehatan</h3>
          <div className="space-y-3">
            <HealthBadge
              isHealthy={healthStatus === "healthy"}
              diseaseName={diseaseName || null}
              confidence={healthConfidence}
            />
            {!healthStatus && (
              <p className="text-sm text-zinc-500 mt-2">
                Tanaman ini terdeteksi memiliki masalah kesehatan. Lihat panduan perawatan untuk penanganan.
              </p>
            )}
          </div>
        </div>
      </div>

      {plant?.distributions && plant.distributions.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white rounded-xl border border-zinc-100 p-5">
            <DistributionMap distributions={plant.distributions} />
          </div>
        </div>
      )}

      {(plant?.careGuide || loading) && (
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="bg-white rounded-xl border border-zinc-100 p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="w-4 h-4 border-2 border-zinc-200 border-t-green-600 rounded-full animate-spin" />
                Memuat panduan perawatan...
              </div>
            ) : plant?.careGuide ? (
              <CareGuide careGuide={plant.careGuide} />
            ) : (
              <p className="text-zinc-400 text-sm">Panduan perawatan belum tersedia untuk tanaman ini.</p>
            )}
          </div>
        </div>
      )}

      {plant?.diseases && plant.diseases.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-4">
            <h3 className="font-semibold text-zinc-700 text-sm">Penyakit Umum</h3>
            {plant.diseases.map((disease) => (
              <div key={disease.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="font-semibold text-red-800">{disease.name}</h4>
                {disease.scientificName && (
                  <p className="text-xs text-red-600 italic">{disease.scientificName}</p>
                )}
                <div className="mt-2 space-y-1 text-sm text-red-700">
                  <p><strong>Gejala:</strong> {disease.symptoms}</p>
                  {disease.cause && <p><strong>Penyebab:</strong> {disease.cause}</p>}
                  <p><strong>Pengobatan:</strong> {disease.treatment}</p>
                  {disease.prevention && <p><strong>Pencegahan:</strong> {disease.prevention}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pb-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Identifikasi tanaman lain
        </a>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
