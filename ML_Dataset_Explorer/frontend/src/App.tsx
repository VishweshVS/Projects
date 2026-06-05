// ─── App.tsx ───────────────────────────────────────────────────────────────
// This is the ROOT component — the brain of the whole frontend.
// It:
//   1. Holds all state (list of datasets, loading status, etc.)
//   2. Makes API calls (create, update, delete, search)
//   3. Passes data DOWN to child components as props
//   4. Passes callback functions DOWN so children can trigger actions

import { useState, useEffect, useCallback } from "react";
import type { Dataset, DatasetCreate, Stats } from "./types";
import { fetchDatasets, fetchStats, createDataset, updateDataset, deleteDataset } from "./api";
import DatasetCard from "./components/DatasetCard";
import DatasetForm from "./components/DatasetForm";
import StatsBar from "./components/StatsBar";

export default function App() {
  // ── STATE ──────────────────────────────────────────────────────────────
  // Each useState call creates a reactive variable.
  // When you call the setter (e.g. setDatasets), React re-renders the UI.

  const [datasets, setDatasets]     = useState<Dataset[]>([]);   // list shown in UI
  const [stats, setStats]           = useState<Stats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");               // search box value
  const [showForm, setShowForm]     = useState(false);            // modal visibility
  const [editing, setEditing]       = useState<Dataset | null>(null); // which dataset to edit

  // ── DATA FETCHING ──────────────────────────────────────────────────────
  // useCallback memoizes the function so it doesn't re-create on every render
  const loadData = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Run both requests simultaneously with Promise.all (faster than sequential)
      const [data, statsData] = await Promise.all([
        fetchDatasets(searchQuery),
        fetchStats(),
      ]);
      setDatasets(data);
      setStats(statsData);
    } catch (err) {
      setError("Could not connect to the backend. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false); // always runs, even if there was an error
    }
  }, []);

  // useEffect runs AFTER the component renders.
  // The empty [] dependency array means "run once when the page loads".
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── SEARCH ─────────────────────────────────────────────────────────────
  // Called every time the search input changes
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    loadData(value || undefined); // send search query to backend
  }

  // ── CREATE ─────────────────────────────────────────────────────────────
  async function handleCreate(data: DatasetCreate) {
    try {
      const created = await createDataset(data);  // POST to FastAPI
      setDatasets((prev) => [...prev, created]);  // add new card without full reload
      setShowForm(false);
      fetchStats().then(setStats);                // refresh stats counter
    } catch {
      alert("Failed to create dataset. Check the backend.");
    }
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────
  async function handleUpdate(data: DatasetCreate) {
    if (!editing) return;
    try {
      const updated = await updateDataset(editing.id, data); // PUT to FastAPI
      // Replace the old dataset in the list with the updated one
      setDatasets((prev) => prev.map((d) => d.id === updated.id ? updated : d));
      setEditing(null);
      setShowForm(false);
      fetchStats().then(setStats);
    } catch {
      alert("Failed to update dataset.");
    }
  }

  // ── DELETE ─────────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm("Delete this dataset?")) return; // browser confirm dialog
    try {
      await deleteDataset(id);                          // DELETE to FastAPI
      setDatasets((prev) => prev.filter((d) => d.id !== id)); // remove from UI
      fetchStats().then(setStats);
    } catch {
      alert("Failed to delete dataset.");
    }
  }

  // ── OPEN EDIT MODAL ────────────────────────────────────────────────────
  function handleEditClick(dataset: Dataset) {
    setEditing(dataset);   // store which dataset we're editing
    setShowForm(true);     // show the modal
  }

  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-violet-400">ML</span> Dataset Explorer
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Manage your machine learning datasets</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold
                       px-4 py-2 rounded-xl transition-colors text-sm"
          >
            + Add Dataset
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats dashboard */}
        <StatsBar stats={stats} />

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="🔍  Search datasets by name..."
            className="w-full md:w-96 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5
                       text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3 animate-spin inline-block">⚙️</div>
            <p>Loading datasets...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && datasets.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">No datasets found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term." : "Click '+ Add Dataset' to get started."}
            </p>
          </div>
        )}

        {/* Dataset grid */}
        {!loading && datasets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              // Each DatasetCard gets its data + two callback functions
              <DatasetCard
                key={dataset.id}          // React needs a unique key for each list item
                dataset={dataset}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── MODAL FORM (shown when showForm is true) ─────────────────── */}
      {showForm && (
        <DatasetForm
          editing={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
