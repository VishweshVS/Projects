// ─── api.ts ────────────────────────────────────────────────────────────────
// This file contains ALL communication with the FastAPI backend.
// Every component imports functions from here instead of writing axios calls directly.
// This makes it easy to change the backend URL in one place.

import axios from "axios";
import type { Dataset, DatasetCreate, DatasetUpdate, Stats } from "../types";

// Base URL of our FastAPI server
const BASE_URL = "http://localhost:8000";

// Create an axios instance with the base URL pre-configured
const api = axios.create({ baseURL: BASE_URL });

// ─── GET /datasets (optionally filtered by search query) ──────────────────
export async function fetchDatasets(search?: string): Promise<Dataset[]> {
  const params = search ? { search } : {};
  const response = await api.get<Dataset[]>("/datasets", { params });
  return response.data; // response.data is the JSON the server sent back
}

// ─── GET /datasets/stats ──────────────────────────────────────────────────
export async function fetchStats(): Promise<Stats> {
  const response = await api.get<Stats>("/datasets/stats");
  return response.data;
}

// ─── GET /datasets/:id ────────────────────────────────────────────────────
export async function fetchDatasetById(id: number): Promise<Dataset> {
  const response = await api.get<Dataset>(`/datasets/${id}`);
  return response.data;
}

// ─── POST /datasets ───────────────────────────────────────────────────────
export async function createDataset(data: DatasetCreate): Promise<Dataset> {
  const response = await api.post<Dataset>("/datasets", data);
  return response.data; // Backend returns the newly created dataset (with its id)
}

// ─── PUT /datasets/:id ────────────────────────────────────────────────────
export async function updateDataset(id: number, data: DatasetUpdate): Promise<Dataset> {
  const response = await api.put<Dataset>(`/datasets/${id}`, data);
  return response.data;
}

// ─── DELETE /datasets/:id ─────────────────────────────────────────────────
export async function deleteDataset(id: number): Promise<void> {
  await api.delete(`/datasets/${id}`);
  // No data returned on delete — we just need to know it succeeded
}
