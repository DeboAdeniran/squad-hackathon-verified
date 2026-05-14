import random
from typing import List
from schemas import MlFlag

class DocumentProcessor:
    def __init__(self, score_per_url: int = 40, error_chance: float = 0.1):
        self.score_per_url = score_per_url
        self.error_chance = error_chance
        # In production, initialize OCR engines (EasyOCR, Tesseract)
        pass

    def analyze_documents(self, urls: List[str]) -> tuple[int, List[MlFlag]]:
        """
        Performs OCR and document authenticity checks.
        """
        if not urls:
            return 0, [MlFlag(module="DOCUMENT", signal="MISSING_DOCS", explanation="No supporting documents (receipts/reports) attached.")]
            
        # Placeholder OCR logic
        score = min(100, len(urls) * self.score_per_url + random.randint(0, 10))
        
        flags = []
        # Simulate an OCR mismatch flag
        if random.random() < self.error_chance:
            flags.append(MlFlag(
                module="DOCUMENT",
                signal="OCR_NAME_MISMATCH",
                explanation="Name on receipt does not match claimant name."
            ))
            
        return score, flags
