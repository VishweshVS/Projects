// ─── api.ts ────────────────────────────────────────────────────────────────
// KEY CHANGE: We now send FormData instead of JSON.
// Why? Because JSON cannot carry binary file data.
// FormData is what browsers use for multipart/form-data — it bundles
// text fields AND file bytes together in one HTTP request.

import axios from "axios";
import type { Dataset, DatasetCreate, DatasetUpdate, Stats } from "./types";

const BASE_URL = "http://localhost:8000";
const api = axios.create({ baseURL: BASE_URL });

// ─── Build FormData from a plain object ───────────────────────────────────
// FormData is like a bag that holds both text and files.
// You append each field by name, just like a real HTML form.
function toFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (value instanceof File) {
      fd.append(key, value);          // File object → binary bytes
    } else {
      fd.append(key, String(value));  // numbers/strings → text
    }
  }
  return fd;
}

export async function fetchDatasets(search?: string): Promise<Dataset[]> {
  const params = search ? { search } : {};
  const res = await api.get<Dataset[]>("/datasets", { params });
  return res.data;
}

export async function fetchStats(): Promise<Stats> {
  const res = await api.get<Stats>("/datasets/stats");
  return res.data;
}

export async function fetchDatasetById(id: number): Promise<Dataset> {
  const res = await api.get<Dataset>(`/datasets/${id}`);
  return res.data;
}

export async function createDataset(data: DatasetCreate): Promise<Dataset> {
  // Convert to FormData so the file bytes are included
  const fd = toFormData(data as Record<string, unknown>);
  const res = await api.post<Dataset>("/datasets", fd);
  // Note: No Content-Type header needed — axios sets it automatically
  // to "multipart/form-data" with the correct boundary when given FormData
  return res.data;
}

export async function updateDataset(id: number, data: DatasetUpdate): Promise<Dataset> {
  const fd = toFormData(data as Record<string, unknown>);
  const res = await api.put<Dataset>(`/datasets/${id}`, fd);
  return res.data;
}

export async function deleteDataset(id: number): Promise<void> {
  await api.delete(`/datasets/${id}`);
}
