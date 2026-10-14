from app.services.exp_extractor import ExperienceExtractor

def test_experience_extraction():
    extractor = ExperienceExtractor()
    jd = "Looking for a Data Scientist with 5+ years of experience in Python."
    resume = "I have 3 years of experience as an NLP Engineer."
    
    assert extractor.extract_required_experience(jd) == 5.0
    assert extractor.extract_candidate_experience(resume) == 3.0
