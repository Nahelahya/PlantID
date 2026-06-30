"use client";

import { useEffect, useRef } from "react";
import type { Distribution } from "@/types";

interface DistributionMapProps {
  distributions: Distribution[];
}

export default function DistributionMap({ distributions }: DistributionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = async () => {
      const L = await import("leaflet");

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([0, 120], 3);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      distributions.forEach((dist) => {
        const color = dist.type === "native" ? "#16a34a" : "#f59e0b";
        const marker = L.circleMarker([dist.latitude, dist.longitude], {
          radius: 8,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <b>${dist.region}</b><br/>
          ${dist.country}<br/>
          <span style="color:${color}">${dist.type === "native" ? "Asli" : "Introduksi"}</span>
        `);
      });

      if (distributions.length > 1) {
        const bounds = L.latLngBounds(distributions.map((d) => [d.latitude, d.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [distributions]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-zinc-700 text-sm">Persebaran</h3>
      <div ref={mapRef} className="h-64 w-full rounded-lg border border-zinc-200" />
      <div className="flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-600" /> Asli
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Introduksi
        </span>
      </div>
    </div>
  );
}
