export type DatasetType = "Tabular" | "Image" | "Text" | "Audio";

export type DatasetStatus =
  | "Not Explored"
  | "Exploring"
  | "Ready for Training"
  | "Trained";

export interface Dataset {
  id: number;
  name: string;
  description: string;
  type: DatasetType;
  rows: number;
  features: number;
  status: DatasetStatus;
  created_at: string;
  // New file fields (optional — not every dataset has a file)
  file_url:  string | null;
  file_name: string | null;
  file_type: string | null;
}

export interface DatasetCreate {
  name: string;
  description: string;
  type: DatasetType;
  rows: number;
  features: number;
  status: DatasetStatus;
  file?: File | null;   // The actual File object from <input type="file">
}

export interface DatasetUpdate {
  description?: string;
  type?: DatasetType;
  rows?: number;
  features?: number;
  status?: DatasetStatus;
  file?: File | null;
}

export interface Stats {
  total: number;
  by_type: Record<DatasetType, number>;
  by_status: Record<DatasetStatus, number>;
}
