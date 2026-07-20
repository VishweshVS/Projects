// ─── DatasetForm.tsx ───────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import type { Dataset, DatasetCreate, DatasetType, DatasetStatus } from "../types";

interface Props {
  editing?: Dataset | null;
  onSubmit: (data: DatasetCreate) => void;
  onCancel: () => void;
}

const TYPES: DatasetType[]      = ["Tabular", "Image", "Text", "Audio"];
const STATUSES: DatasetStatus[] = ["Not Explored", "Exploring", "Ready for Training", "Trained"];

// What file types to show in the OS file picker per dataset type
const ACCEPT: Record<DatasetType, string> = {
  Image:   "image/*",
  Audio:   "audio/*",
  Text:    ".txt,.csv,.json,.xml,.md",
  Tabular: ".csv,.xlsx,.tsv,.json",
};

const EMPTY: DatasetCreate = {
  name: "", description: "", type: "Tabular",
  rows: 0, features: 0, status: "Not Explored", file: null,
};

export default function DatasetForm({ editing, onSubmit, onCancel }: Props) {
  const [form, setForm]           = useState<DatasetCreate>(EMPTY);
  const [preview, setPreview]     = useState<string | null>(null); // image preview URL
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name, description: editing.description,
        type: editing.type, rows: editing.rows,
        features: editing.features, status: editing.status, file: null,
      });
      // Show existing file as preview if it's an image
      if (editing.file_url && editing.file_type &&
          [".jpg",".jpeg",".png",".gif",".webp"].includes(editing.file_type)) {
        setPreview(editing.file_url);
      } else {
        setPreview(null);
      }
    } else {
      setForm(EMPTY);
      setPreview(null);
    }
  }, [editing]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "rows" || name === "features" ? Number(value) : value,
      // When dataset type changes, clear the file (wrong format might be selected)
      ...(name === "type" ? { file: null } : {}),
    }));
    if (name === "type") {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Handle file selection (from input OR drag-and-drop) ─────────────────
  function handleFile(file: File | null) {
    if (!file) return;
    setForm(prev => ({ ...prev, file }));

    // If it's an image, generate a local preview URL so user sees it
    // URL.createObjectURL() creates a temporary browser URL for a File object
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null); // audio/text — no image preview
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  // ── Drag and Drop handlers ───────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
    setForm(EMPTY);
    setPreview(null);
  }

  const isEditing = Boolean(editing);
  const accept    = ACCEPT[form.type];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "✏️ Edit Dataset" : "➕ Add New Dataset"}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dataset Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              disabled={isEditing} required placeholder="e.g. Iris Dataset"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white
                         placeholder-gray-500 focus:outline-none focus:border-violet-500
                         disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              required rows={2} placeholder="What is this dataset about?"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white
                         placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Rows + Features */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rows</label>
              <input name="rows" type="number" value={form.rows} onChange={handleChange} min={0} required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Features</label>
              <input name="features" type="number" value={form.features} onChange={handleChange} min={0} required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          {/* ── FILE UPLOAD ZONE ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload File
              <span className="text-gray-500 font-normal ml-2">(optional)</span>
            </label>

            {/* Drag & Drop zone — clicking it also opens the file picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors
                ${dragOver
                  ? "border-violet-400 bg-violet-500/10"
                  : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"}`}
            >
              {/* Image preview */}
              {preview ? (
                <img src={preview} alt="preview"
                  className="max-h-32 mx-auto rounded-lg object-contain mb-2" />
              ) : (
                <div className="text-3xl mb-1">
                  {form.type === "Image" ? "🖼️" : form.type === "Audio" ? "🎵" : "📄"}
                </div>
              )}

              {/* Show selected file name OR audio name */}
              {form.file ? (
                <p className="text-sm text-violet-300 font-medium">{form.file.name}</p>
              ) : editing?.file_name ? (
                <p className="text-sm text-gray-400">Current: {editing.file_name}</p>
              ) : (
                <p className="text-sm text-gray-400">
                  Drag & drop or <span className="text-violet-400">click to browse</span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Accepted: {accept}</p>
            </div>

            {/* Hidden real file input — triggered by clicking the zone above */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Audio player — shown immediately after selecting an audio file */}
            {form.file && form.type === "Audio" && (
              <audio controls src={URL.createObjectURL(form.file)}
                className="w-full mt-2 rounded-lg" />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300
                         hover:bg-gray-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500
                         text-white font-medium transition-colors">
              {isEditing ? "Save Changes" : "Create Dataset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
