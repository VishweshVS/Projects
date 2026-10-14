import json
import os
import spacy
from typing import List, Set
from app.config import settings

class EntityExtractorService:
    def __init__(self):
        self.nlp = spacy.load(settings.SPACY_MODEL_NAME)
        self._load_skill_ruler()

    def _load_skill_ruler(self):
        if "entity_ruler" not in self.nlp.pipe_names:
            ruler = self.nlp.add_pipe("entity_ruler", before="ner")
            patterns_path = settings.SKILL_PATTERNS_PATH
            if os.path.exists(patterns_path):
                with open(patterns_path, "r", encoding="utf-8") as f:
                    patterns = json.load(f)
                    ruler.add_patterns(patterns)

    def extract_skills(self, text: str) -> List[str]:
        doc = self.nlp(text)
        skills: Set[str] = set()
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                skills.add(ent.text.strip())
        return list(skills)

    def extract_education(self, text: str) -> List[str]:
        text_lower = text.lower()
        degrees = ["bachelor", "master", "phd", "b.sc", "m.sc", "b.tech", "m.tech", "bs", "ms", "degree", "diploma"]
        found = []
        for deg in degrees:
            if deg in text_lower:
                found.append(deg.upper())
        return list(set(found))
