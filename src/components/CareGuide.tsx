import type { CareGuide as CareGuideType } from "@/types";

interface CareGuideProps {
  careGuide: CareGuideType;
}

const CARE_ITEMS: { key: keyof CareGuideType; label: string; icon: string }[] = [
  { key: "watering", label: "Penyiraman", icon: "💧" },
  { key: "sunlight", label: "Sinar Matahari", icon: "☀️" },
  { key: "temperature", label: "Suhu", icon: "🌡️" },
  { key: "soil", label: "Tanah", icon: "🪴" },
  { key: "fertilizer", label: "Pemupukan", icon: "🧪" },
  { key: "humidity", label: "Kelembaban", icon: "💨" },
  { key: "toxicity", label: "Toksisitas", icon: "⚠️" },
  { key: "pruning", label: "Pemangkasan", icon: "✂️" },
  { key: "repotting", label: "Repotting", icon: "🪴" },
  { key: "difficulty", label: "Tingkat Kesulitan", icon: "📊" },
];

export default function CareGuide({ careGuide }: CareGuideProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-zinc-700 text-sm">Panduan Perawatan</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {CARE_ITEMS.map((item) => {
          const value = careGuide[item.key];
          if (!value) return null;
          return (
            <div key={item.key} className="flex gap-2 p-3 bg-white rounded-lg border border-zinc-100">
              <span className="text-lg shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-zinc-400">{item.label}</p>
                <p className="text-sm text-zinc-700">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
