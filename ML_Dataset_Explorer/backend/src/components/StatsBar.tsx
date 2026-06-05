// ─── StatsBar.tsx ──────────────────────────────────────────────────────────
// Shows the dashboard statistics at the top of the page.
// Props: receives `stats` from the parent (App.tsx) — no API calls here.

import type { Stats } from "../types";

interface Props {
  stats: Stats | null; // null while loading
}

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;

  const cards = [
    { label: "Total Datasets", value: stats.total, color: "bg-violet-500" },
    { label: "Tabular",        value: stats.by_type.Tabular, color: "bg-blue-500" },
    { label: "Image",          value: stats.by_type.Image,   color: "bg-emerald-500" },
    { label: "Text",           value: stats.by_type.Text,    color: "bg-amber-500" },
    { label: "Audio",          value: stats.by_type.Audio,   color: "bg-rose-500" },
    { label: "Trained",        value: stats.by_status.Trained, color: "bg-teal-500" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center"
        >
          <div className={`text-2xl font-black ${card.color.replace("bg-", "text-")}`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-medium">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
