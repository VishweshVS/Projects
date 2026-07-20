from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import shutil, os, uuid
import uvicorn

app = FastAPI(title="ML Dataset Explorer API")

# ─── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── UPLOADS FOLDER ─────────────────────────────────────────────────────────
# Files are saved here on disk so React can display them
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve the uploads folder as static files at /files/filename
# So React can show images at: http://localhost:8000/files/abc.png
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

# ─── ALLOWED FILE TYPES per dataset type ────────────────────────────────────
ALLOWED = {
    "Image":   [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],
    "Audio":   [".mp3", ".wav", ".ogg", ".flac", ".m4a"],
    "Text":    [".txt", ".csv", ".json", ".xml", ".md"],
    "Tabular": [".csv", ".xlsx", ".tsv", ".json"],
}

# ─── DATA MODELS ────────────────────────────────────────────────────────────

class DatasetUpdate(BaseModel):
    description: Optional[str] = None
    type: Optional[str] = None
    rows: Optional[int] = None
    features: Optional[int] = None
    status: Optional[str] = None

class Dataset(BaseModel):
    id: int
    name: str
    description: str
    type: str
    rows: int
    features: int
    status: str
    created_at: str
    # New fields for file uploads
    file_url: Optional[str] = None      # URL React uses to show/play the file
    file_name: Optional[str] = None     # Original filename e.g. "cats.zip"
    file_type: Optional[str] = None     # Extension e.g. ".png"

# ─── IN-MEMORY DATABASE ─────────────────────────────────────────────────────
datasets: List[Dataset] = [
    Dataset(id=1, name="Iris Dataset", description="Classic flower classification dataset",
            type="Tabular", rows=150, features=4, status="Ready for Training",
            created_at="2024-01-15"),
    Dataset(id=2, name="MNIST Digits", description="Handwritten digit images (0–9)",
            type="Image", rows=70000, features=784, status="Trained",
            created_at="2024-01-16"),
    Dataset(id=3, name="IMDB Reviews", description="Movie reviews for sentiment analysis",
            type="Text", rows=50000, features=1, status="Exploring",
            created_at="2024-01-17"),
]
next_id = 4

# ─── HELPERS ────────────────────────────────────────────────────────────────

def save_upload(file: UploadFile) -> tuple[str, str, str]:
    """
    Saves an uploaded file to disk with a unique name.
    Returns: (file_url, saved_filename, extension)

    Why unique name? Prevents collisions if two users upload "data.csv"
    """
    ext = os.path.splitext(file.filename)[1].lower()          # e.g. ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"                  # e.g. "a3f9...c2.png"
    save_path = os.path.join(UPLOAD_DIR, unique_name)

    # Write file bytes to disk
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_url = f"http://localhost:8000/files/{unique_name}"
    return file_url, file.filename, ext


def delete_file_if_exists(file_url: Optional[str]):
    """Delete old file from disk when a dataset is updated or deleted"""
    if not file_url:
        return
    filename = file_url.split("/files/")[-1]
    path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)

# ─── ENDPOINTS ──────────────────────────────────────────────────────────────

@app.get("/datasets", response_model=List[Dataset])
def get_all_datasets(search: Optional[str] = None):
    if search:
        return [d for d in datasets if search.lower() in d.name.lower()]
    return datasets


@app.get("/datasets/stats")
def get_stats():
    return {
        "total": len(datasets),
        "by_type": {
            "Tabular": sum(1 for d in datasets if d.type == "Tabular"),
            "Image":   sum(1 for d in datasets if d.type == "Image"),
            "Text":    sum(1 for d in datasets if d.type == "Text"),
            "Audio":   sum(1 for d in datasets if d.type == "Audio"),
        },
        "by_status": {
            "Not Explored":       sum(1 for d in datasets if d.status == "Not Explored"),
            "Exploring":          sum(1 for d in datasets if d.status == "Exploring"),
            "Ready for Training": sum(1 for d in datasets if d.status == "Ready for Training"),
            "Trained":            sum(1 for d in datasets if d.status == "Trained"),
        }
    }


@app.get("/datasets/{dataset_id}", response_model=Dataset)
def get_dataset(dataset_id: int):
    for d in datasets:
        if d.id == dataset_id:
            return d
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@app.post("/datasets", response_model=Dataset, status_code=201)
async def create_dataset(
    # ── Why Form(...) instead of a JSON body? ──────────────────────────────
    # When uploading files, the browser sends "multipart/form-data" not JSON.
    # FastAPI's Form() reads text fields from that multipart request.
    name:        str = Form(...),
    description: str = Form(...),
    type:        str = Form(...),
    rows:        int = Form(...),
    features:    int = Form(...),
    status:      str = Form("Not Explored"),
    # file is optional — user may not attach one
    file: Optional[UploadFile] = File(None),
):
    global next_id

    file_url = file_name = file_type = None

    if file and file.filename:
        # Validate the file extension matches the dataset type
        ext = os.path.splitext(file.filename)[1].lower()
        allowed_exts = ALLOWED.get(type, [])
        if allowed_exts and ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"For {type} datasets, allowed formats are: {', '.join(allowed_exts)}"
            )
        file_url, file_name, file_type = save_upload(file)

    new_dataset = Dataset(
        id=next_id,
        created_at=datetime.now().strftime("%Y-%m-%d"),
        name=name, description=description, type=type,
        rows=rows, features=features, status=status,
        file_url=file_url, file_name=file_name, file_type=file_type,
    )
    datasets.append(new_dataset)
    next_id += 1
    return new_dataset


@app.put("/datasets/{dataset_id}", response_model=Dataset)
async def update_dataset(
    dataset_id: int,
    description: Optional[str] = Form(None),
    type:        Optional[str] = Form(None),
    rows:        Optional[int] = Form(None),
    features:    Optional[int] = Form(None),
    status:      Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    for i, d in enumerate(datasets):
        if d.id == dataset_id:
            updated = d.dict()

            # Apply text field updates
            if description is not None: updated["description"] = description
            if type is not None:        updated["type"] = type
            if rows is not None:        updated["rows"] = rows
            if features is not None:    updated["features"] = features
            if status is not None:      updated["status"] = status

            # Handle new file upload
            if file and file.filename:
                delete_file_if_exists(d.file_url)   # remove old file
                ext = os.path.splitext(file.filename)[1].lower()
                dataset_type = updated["type"]
                allowed_exts = ALLOWED.get(dataset_type, [])
                if allowed_exts and ext not in allowed_exts:
                    raise HTTPException(status_code=400,
                        detail=f"Allowed formats: {', '.join(allowed_exts)}")
                url, fname, ftype = save_upload(file)
                updated["file_url"]  = url
                updated["file_name"] = fname
                updated["file_type"] = ftype

            datasets[i] = Dataset(**updated)
            return datasets[i]

    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: int):
    for i, d in enumerate(datasets):
        if d.id == dataset_id:
            delete_file_if_exists(d.file_url)   # clean up the file from disk
            datasets.pop(i)
            return {"message": f"Dataset {dataset_id} deleted"}
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
