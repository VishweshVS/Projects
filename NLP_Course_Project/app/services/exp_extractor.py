import re

class ExperienceExtractor:
    def extract_required_experience(self, text: str) -> float:
        patterns = [
            r"(\d+(?:\.\d+)?)\+?\s*(?:-\s*\d+\s*)?(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?",
            r"experience\s*(?:of)?\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)"
        ]
        matches = []
        for pat in patterns:
            found = re.findall(pat, text, re.IGNORECASE)
            for m in found:
                try:
                    matches.append(float(m))
                except ValueError:
                    pass
        return max(matches) if matches else 0.0

    def extract_candidate_experience(self, text: str) -> float:
        patterns = [
            r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience",
            r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:in|as|working)"
        ]
        matches = []
        for pat in patterns:
            found = re.findall(pat, text, re.IGNORECASE)
            for m in found:
                try:
                    matches.append(float(m))
                except ValueError:
                    pass
        return max(matches) if matches else 0.0
