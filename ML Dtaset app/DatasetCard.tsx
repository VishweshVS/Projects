// ─── DatasetCard.tsx ───────────────────────────────────────────────────────
import React from "react";
import type { Dataset } from "../types";

interface Props {
  dataset: Dataset;
  onEdit:   (dataset: Dataset) => void;
  onDelete: (id: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Tabular: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Image:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Text:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Audio:   "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  "Not Explored":       "bg-gray-500/20 text-gray-400",
  "Exploring":          "bg-yellow-500/20 text-yellow-300",
  "Ready for Training": "bg-blue-500/20 text-blue-300",
  "Trained":            "bg-green-500/20 text-green-300",
};

const TYPE_ICONS: Record<string, string> = {
  Tabular: "📊", Image: "🖼️", Text: "📝", Audio: "🎵",
};

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
const AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];

export default function DatasetCard({ dataset, onEdit, onDelete }: Props) {
  const hasFile  = Boolean(dataset.file_url);
  const isImage  = hasFile && IMAGE_EXTS.includes(dataset.file_type ?? "");
  const isAudio  = hasFile && AUDIO_EXTS.includes(dataset.file_type ?? "");
  const isOther  = hasFile && !isImage && !isAudio;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden
                    hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 flex flex-col">

      {/* ── IMAGE PREVIEW (shown at top if dataset has an image file) ── */}
      {isImage && (
        <div className="w-full h-40 bg-gray-900 overflow-hidden">
          <img
            src={dataset.file_url!}
            alt={dataset.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TYPE_ICONS[dataset.type] ?? "📁"}</span>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{dataset.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{dataset.created_at}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${TYPE_COLORS[dataset.type]}`}>
            {dataset.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{dataset.description}</p>

        {/* ── AUDIO PLAYER (inline in the card) ──────────────────────── */}
        {isAudio && (
          <div>
            <p className="text-xs text-gray-400 mb-1">🎵 {dataset.file_name}</p>
            <audio controls src={dataset.file_url!} className="w-full rounded-lg h-8" />
          </div>
        )}

        {/* ── OTHER FILE (CSV, TXT, etc.) — show download link ────────── */}
        {isOther && (
          <a
            href={dataset.file_url!}
            download={dataset.file_name!}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300
                       bg-violet-500/10 rounded-lg px-3 py-2 transition-colors"
          >
            <span>📎</span>
            <span className="truncate">{dataset.file_name}</span>
            <span className="ml-auto text-xs opacity-70">↓ Download</span>
          </a>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex-1 bg-gray-700/50 rounded-lg p-2.5 text-center">
            <div className="font-bold text-white">{dataset.rows.toLocaleString()}</div>
            <div className="text-gray-400 text-xs">Rows</div>
          </div>
          <div className="flex-1 bg-gray-700/50 rounded-lg p-2.5 text-center">
            <div className="font-bold text-white">{dataset.features}</div>
            <div className="text-gray-400 text-xs">Features</div>
          </div>
        </div>

        {/* Status */}
        <span className={`text-xs font-medium px-3 py-1 rounded-full self-start ${STATUS_COLORS[dataset.status]}`}>
          {dataset.status}
        </span>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-gray-700 mt-auto">
          <button onClick={() => onEdit(dataset)}
            className="flex-1 py-2 text-sm font-medium text-gray-300 hover:text-white
                       hover:bg-gray-700 rounded-lg transition-colors">
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(dataset.id)}
            className="flex-1 py-2 text-sm font-medium text-red-400 hover:text-red-300
                       hover:bg-red-500/10 rounded-lg transition-colors">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
