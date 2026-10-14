import os

class Settings:
    # Model Configurations
    SBERT_MODEL_NAME: str = "all-MiniLM-L6-v2"
    SPACY_MODEL_NAME: str = "en_core_web_sm"
    
    # ATS Scoring Weights (Must sum to 1.0)
    WEIGHT_SEMANTIC: float = 0.35
    WEIGHT_SKILL: float = 0.40
    WEIGHT_EXP: float = 0.15
    WEIGHT_EDU: float = 0.10

    # Penalty exponent for experience deficits
    EXP_PENALTY_ALPHA: float = 1.5

    # Path to Skill Taxonomy JSON
    SKILL_PATTERNS_PATH: str = os.path.join(
        os.path.dirname(__file__), "data", "skill_patterns.json"
    )

settings = Settings()
