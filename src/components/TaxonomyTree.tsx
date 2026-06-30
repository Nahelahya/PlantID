interface TaxonomyTreeProps {
  kingdom: string;
  family: string;
  genus: string;
  scientificName: string;
}

export default function TaxonomyTree({ kingdom, family, genus, scientificName }: TaxonomyTreeProps) {
  const levels = [
    { label: "Kingdom", value: kingdom },
    { label: "Famili", value: family },
    { label: "Genus", value: genus },
    { label: "Spesies", value: scientificName },
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-zinc-700 text-sm">Klasifikasi Ilmiah</h3>
      <div className="space-y-1">
        {levels.map((level, i) => (
          <div key={level.label} className="flex items-center gap-2 text-sm">
            <span className="w-16 text-zinc-400 text-xs">{level.label}</span>
            <div className="flex-1 flex items-center gap-2">
              {i > 0 && <div className="w-4 h-px bg-zinc-300" />}
              <span className={`${i === levels.length - 1 ? "font-semibold text-green-700" : "text-zinc-700"}`}>
                <em>{level.value}</em>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
