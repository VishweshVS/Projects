from pydantic import BaseModel, Field
from typing import List, Dict, Any

class EvaluationRequest(BaseModel):
    job_description: str = Field(..., description="Full text of the Job Description")
    resume_text: str = Field(..., description="Extracted raw text of the Candidate Resume")

class DetailedScores(BaseModel):
    semantic_score: float
    skill_score: float
    experience_score: float
    education_score: float

class SkillAnalysis(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    resume_skills: List[str]
    jd_skills: List[str]

class ExperienceAnalysis(BaseModel):
    required_years: float
    candidate_years: float

class EvaluationResponse(BaseModel):
    overall_score: float
    detailed_scores: DetailedScores
    skills: SkillAnalysis
    experience: ExperienceAnalysis
    recommendations: List[str]
