from sentence_transformers import SentenceTransformer, util
from app.config import settings
from app.services.exp_extractor import ExperienceExtractor
from app.services.entity_extractor import EntityExtractorService
from app.schemas import EvaluationResponse, DetailedScores, SkillAnalysis, ExperienceAnalysis

class ATSScorerService:
    def __init__(self):
        self.sbert_model = SentenceTransformer(settings.SBERT_MODEL_NAME)
        self.exp_extractor = ExperienceExtractor()
        self.entity_service = EntityExtractorService()

    def compute_experience_score(self, req_years: float, cand_years: float) -> float:
        if req_years == 0 or cand_years >= req_years:
            return 100.0
        return float(100.0 * ((cand_years / req_years) ** settings.EXP_PENALTY_ALPHA))

    def evaluate(self, jd_text: str, resume_text: str) -> EvaluationResponse:
        # 1. Semantic Match via SBERT
        emb_jd = self.sbert_model.encode(jd_text, convert_to_tensor=True)
        emb_res = self.sbert_model.encode(resume_text, convert_to_tensor=True)
        cos_sim = float(util.cos_sim(emb_jd, emb_res)[0][0])
        s_semantic = max(0.0, min(100.0, cos_sim * 100.0))

        # 2. Skill Overlap
        jd_skills = self.entity_service.extract_skills(jd_text)
        res_skills = self.entity_service.extract_skills(resume_text)
        
        set_jd = set([s.lower() for s in jd_skills])
        set_res = set([s.lower() for s in res_skills])
        
        matched = set_jd.intersection(set_res)
        missing = set_jd - set_res
        
        s_skill = (len(matched) / len(set_jd) * 100.0) if set_jd else 100.0

        # 3. Experience Match
        req_exp = self.exp_extractor.extract_required_experience(jd_text)
        cand_exp = self.exp_extractor.extract_candidate_experience(resume_text)
        s_exp = self.compute_experience_score(req_exp, cand_exp)

        # 4. Education Match
        jd_edu = self.entity_service.extract_education(jd_text)
        res_edu = self.entity_service.extract_education(resume_text)
        s_edu = 100.0 if not jd_edu or set([e.lower() for e in jd_edu]).intersection(set([e.lower() for e in res_edu])) else 50.0

        # Overall Score Computation
        overall = (
            settings.WEIGHT_SEMANTIC * s_semantic +
            settings.WEIGHT_SKILL * s_skill +
            settings.WEIGHT_EXP * s_exp +
            settings.WEIGHT_EDU * s_edu
        )

        # Recommendations Generation
        recs = []
        if missing:
            recs.append(f"Add missing key skills to your resume: {', '.join(list(missing)[:5])}")
        if cand_exp < req_exp:
            recs.append(f"Highlight past project impact to bridge the experience gap ({cand_exp} yrs vs {req_exp} yrs required).")
        if s_semantic < 60.0:
            recs.append("Align the terminology and phrase structure in your professional summary with the job description.")

        return EvaluationResponse(
            overall_score=round(overall, 2),
            detailed_scores=DetailedScores(
                semantic_score=round(s_semantic, 2),
                skill_score=round(s_skill, 2),
                experience_score=round(s_exp, 2),
                education_score=round(s_edu, 2)
            ),
            skills=SkillAnalysis(
                matched_skills=list(matched),
                missing_skills=list(missing),
                resume_skills=res_skills,
                jd_skills=jd_skills
            ),
            experience=ExperienceAnalysis(
                required_years=req_exp,
                candidate_years=cand_exp
            ),
            recommendations=recs
        )
