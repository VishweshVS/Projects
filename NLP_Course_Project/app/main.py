# app/main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import EvaluationResponse, EvaluationRequest
from app.services.ats_scorer import ATSScorerService
from app.services.pdf_parser import PDFParserService

app = FastAPI(
    title="Resume Screening & ATS Optimization API",
    description="NLP backend powered by spaCy and Sentence-BERT",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer_service = ATSScorerService()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ATS Screener Engine"}

@app.post("/api/v1/screen", response_model=EvaluationResponse)
def screen_resume(payload: EvaluationRequest):
    try:
        return scorer_service.evaluate(payload.job_description, payload.resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/screen-file", response_model=EvaluationResponse)
async def screen_resume_file(
    job_description: str = Form(...),
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        contents = await file.read()
        resume_text = PDFParserService.extract_text_from_pdf_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    return scorer_service.evaluate(job_description, resume_text)