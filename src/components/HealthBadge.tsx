interface HealthBadgeProps {
  isHealthy: boolean;
  diseaseName: string | null;
  confidence: number;
}

export default function HealthBadge({ isHealthy, diseaseName, confidence }: HealthBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      isHealthy
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}>
      <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"}`} />
      {isHealthy ? "Sehat" : diseaseName || "Teridentifikasi"}
      <span className="text-xs opacity-60">{confidence}%</span>
    </div>
  );
}
