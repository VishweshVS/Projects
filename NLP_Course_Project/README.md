# Resume Screening & ATS Optimization Tool

An end-to-end NLP-powered Applicant Tracking System (ATS) pipeline built with FastAPI, spaCy, Sentence-BERT (`all-MiniLM-L6-v2`), and Streamlit.

## Setup Instructions

1. **Create and Activate Virtual Environment (Python 3.11 or 3.12 recommended):**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Run Backend (FastAPI):**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Run Frontend (Streamlit):**
   ```bash
   streamlit run app.py
   ```
