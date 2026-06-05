# ML Dataset Explorer 🧠

A full-stack CRUD application for managing machine learning datasets.
Built with **React + TypeScript + Tailwind CSS v3** (frontend) and **FastAPI** (backend).

---

## 📁 Project Structure

```
ml-dataset-explorer/
├── backend/
│   ├── main.py              ← FastAPI server + all endpoints
│   └── requirements.txt     ← Python dependencies
└── frontend/
    ├── src/
    │   ├── types/index.ts   ← TypeScript type definitions
    │   ├── api.ts           ← All Axios API calls
    │   ├── App.tsx          ← Root component (state + logic)
    │   ├── main.tsx         ← Entry point
    │   ├── index.css        ← Tailwind imports
    │   └── components/
    │       ├── DatasetCard.tsx   ← Single dataset card
    │       ├── DatasetForm.tsx   ← Create/Edit modal form
    │       └── StatsBar.tsx      ← Dashboard statistics
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 🚀 Setup Instructions

### Backend (FastAPI)

```bash
cd backend

# Create a virtual environment (keeps dependencies isolated)
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
# Server runs at http://localhost:8000
# Auto-docs at http://localhost:8000/docs
```

### Frontend (React)

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
# App runs at http://localhost:5173
```

---

## ✅ Features Implemented

- **Create Dataset** — Modal form with all required fields
- **View Datasets** — Responsive card grid with type icons and color coding
- **Update Dataset** — Edit modal pre-filled with existing data
- **Delete Dataset** — Confirmation dialog before deletion
- **Dataset Status** — 4 statuses: Not Explored → Exploring → Ready for Training → Trained
- **Stats Dashboard** — Live counts by type and status *(Bonus)*
- **Search Datasets** — Real-time search by name via `GET /datasets?search=` *(Bonus)*

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets` | Get all datasets |
| GET | `/datasets?search=iris` | Search by name |
| GET | `/datasets/{id}` | Get one dataset |
| POST | `/datasets` | Create dataset |
| PUT | `/datasets/{id}` | Update dataset |
| DELETE | `/datasets/{id}` | Delete dataset |
| GET | `/datasets/stats` | Get statistics |

Interactive API docs: **http://localhost:8000/docs**

---

## 🧩 How Data Flows (Step by Step)

```
1. Page loads → useEffect calls fetchDatasets() + fetchStats()
2. Axios sends GET http://localhost:8000/datasets
3. FastAPI returns JSON array of datasets
4. React stores it in state: setDatasets(data)
5. UI renders a DatasetCard for each dataset

For CREATE:
1. User fills form → clicks "Create Dataset"
2. handleCreate() calls createDataset(formData)
3. Axios sends POST with JSON body
4. FastAPI validates with Pydantic, saves, returns new dataset
5. React adds it to state → new card appears instantly
```

---

## 🛠️ Tech Stack Explained

| Technology | Role | Why |
|-----------|------|-----|
| React | UI rendering | Component-based, reactive state |
| TypeScript | Type safety | Catches bugs before runtime |
| Tailwind CSS v3 | Styling | Utility-first, no separate CSS files |
| Axios | HTTP client | Cleaner than fetch, handles JSON automatically |
| FastAPI | Backend framework | Fast, automatic validation, auto-docs |
| Pydantic | Data validation | Rejects malformed data automatically |
| Uvicorn | ASGI server | Runs the FastAPI app |
